import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Hook para calcular estadísticas de videos vistos
 * @param {string} userId - ID del usuario actual
 * @returns {object} Estadísticas y estado de carga
 */
export function useStatistics(userId) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para calcular días consecutivos
  const calculateStreak = useCallback((dates) => {
    if (!dates || dates.length === 0) return 0;
    
    // Ordenar fechas y eliminar duplicados
    const uniqueDates = [...new Set(dates.map(d => d.split('T')[0]))]
      .sort((a, b) => new Date(b) - new Date(a));
    
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    // Verificar si hoy hay actividad
    const todayStr = currentDate.toISOString().split('T')[0];
    if (uniqueDates.includes(todayStr)) {
      streak = 1;
      currentDate.setDate(currentDate.getDate() - 1);
    }
    
    // Contar días consecutivos hacia atrás
    while (streak > 0) {
      const dateStr = currentDate.toISOString().split('T')[0];
      if (uniqueDates.includes(dateStr)) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  }, []);

  // Función para agrupar por canal
  const groupByChannel = useCallback((videos) => {
    const channels = {};
    
    videos.forEach(video => {
      const channel = video.channelTitle || video.channel || 'Desconocido';
      if (!channels[channel]) {
        channels[channel] = {
          count: 0,
          videos: []
        };
      }
      channels[channel].count++;
      channels[channel].videos.push(video);
    });
    
    // Ordenar por cantidad (descendente)
    return Object.entries(channels)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count);
  }, []);

  // Función para calcular actividad semanal
  const calculateWeeklyActivity = useCallback((videos) => {
    const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const activity = daysOfWeek.map(day => ({ day, count: 0 }));
    
    videos.forEach(video => {
      try {
        const date = new Date(video.watchedAt);
        const dayIndex = date.getDay(); // 0 = Domingo, 1 = Lunes, etc.
        activity[dayIndex].count++;
      } catch {
        // Ignorar fechas inválidas
      }
    });
    
    return activity;
  }, []);

  useEffect(() => {
    if (!userId) {
      setStats(null);
      setLoading(false);
      return;
    }

    const fetchStatistics = async () => {
      try {
        setLoading(true);
        setError(null);

        const userVideosMetaRef = collection(db, "userVideosMeta");
        const q = query(
          userVideosMetaRef,
          where('userId', '==', userId),
          where('seen', '==', true)
        );
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
          setStats({
            totalVideos: 0,
            videosToday: 0,
            videosThisWeek: 0,
            videosThisMonth: 0,
            topChannels: [],
            weeklyActivity: [],
            streak: 0,
            lastActive: null
          });
          setLoading(false);
          return;
        }

        const videos = [];
        const watchedDates = [];
        
        snapshot.forEach(doc => {
          const data = doc.data();
          videos.push({
            ...data,
            // Mapear campos para consistencia
            channelTitle: data.channel || 'Desconocido',
            watchedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
          });
          
          if (data.updatedAt) {
            const date = data.updatedAt.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt);
            watchedDates.push(date.toISOString());
          }
        });

        // Fechas para filtros
        const now = new Date();
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);
        
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        const monthAgo = new Date(now);
        monthAgo.setDate(monthAgo.getDate() - 30);

        // Calcular estadísticas
        const videosToday = videos.filter(v => 
          v.watchedAt && new Date(v.watchedAt) >= today
        ).length;
        
        const videosThisWeek = videos.filter(v => 
          v.watchedAt && new Date(v.watchedAt) >= weekAgo
        ).length;
        
        const videosThisMonth = videos.filter(v => 
          v.watchedAt && new Date(v.watchedAt) >= monthAgo
        ).length;

        const topChannels = groupByChannel(videos).slice(0, 5);
        const weeklyActivity = calculateWeeklyActivity(videos);
        const streak = calculateStreak(watchedDates);
        
        // Última actividad
        const lastWatched = watchedDates.length > 0 
          ? new Date(Math.max(...watchedDates.map(d => new Date(d))))
          : null;

        setStats({
          totalVideos: videos.length,
          videosToday,
          videosThisWeek,
          videosThisMonth,
          topChannels,
          weeklyActivity,
          streak,
          lastActive: lastWatched,
          lastUpdated: new Date().toISOString()
        });

      } catch (err) {
        console.error("Error fetching statistics:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();

    // Actualizar cada 5 minutos si la app está abierta
    const interval = setInterval(fetchStatistics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [userId, calculateStreak, groupByChannel, calculateWeeklyActivity]);

  return { stats, loading, error };
}