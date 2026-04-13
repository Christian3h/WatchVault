import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import Header from '../components/Header/Header';
import StatisticsPanel from '../components/StatisticsPanel/StatisticsPanel';
import { useStatistics } from '../hooks/useStatistics';
import styles from './Statistics.module.css';

function Statistics() {
  const navigate = useNavigate();
  const userId = auth.currentUser?.uid || null;
  const { stats, loading, error } = useStatistics(userId);

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!auth.currentUser) {
      navigate('/login');
    }
  }, [navigate]);

  if (!auth.currentUser) {
    return null; // Se redirigirá automáticamente
  }

  return (
    <div className={styles.container}>
      <Header />
      
      <main className={styles.main}>
        <div className={styles.header}>
          <button 
            className={styles.backButton}
            onClick={() => navigate('/')}
            aria-label="Volver al dashboard"
          >
            ←
          </button>
          <h1 className={styles.title}>Estadísticas</h1>
          <div className={styles.headerSpacer}></div>
        </div>

        <div className={styles.content}>
          <StatisticsPanel 
            stats={stats}
            loading={loading}
            error={error}
          />

          {stats && stats.totalVideos > 0 && (
            <div className={styles.insights}>
              <h2>Insights</h2>
              
              <div className={styles.insightCards}>
                {stats.videosToday > 0 && (
                  <div className={styles.insightCard}>
                    <div className={styles.insightIcon}>HOY</div>
                    <div className={styles.insightContent}>
                      <h3>Actividad hoy</h3>
                      <p>Llevas {stats.videosToday} video{stats.videosToday !== 1 ? 's' : ''} visto{stats.videosToday !== 1 ? 's' : ''} hoy{stats.todayWatchTime ? ` (${stats.todayWatchTime})` : ''}.</p>
                    </div>
                  </div>
                )}

                {stats.streak > 1 && (
                  <div className={styles.insightCard}>
                    <div className={styles.insightIcon}>RACHA</div>
                    <div className={styles.insightContent}>
                      <h3>Racha activa</h3>
                      <p>Llevas {stats.streak} día{stats.streak !== 1 ? 's' : ''} consecutivo{stats.streak !== 1 ? 's' : ''} usando WatchVault.</p>
                    </div>
                  </div>
                )}

                {stats.topChannels.length > 0 && (
                  <div className={styles.insightCard}>
                    <div className={styles.insightIcon}>TOP</div>
                    <div className={styles.insightContent}>
                      <h3>Canal favorito</h3>
                      <p>Ves más contenido de <strong>{stats.topChannels[0].name}</strong> ({stats.topChannels[0].count} videos{stats.topChannels[0].watchTime ? `, ${stats.topChannels[0].watchTime}` : ''}).</p>
                    </div>
                  </div>
                )}

                {stats.weeklyActivity && stats.weeklyActivity.some(day => day.count > 0) && (
                  <div className={styles.insightCard}>
                    <div className={styles.insightIcon}>DÍA</div>
                    <div className={styles.insightContent}>
                      <h3>Día más activo</h3>
                      <p>
                        {(() => {
                          const maxDay = [...stats.weeklyActivity].sort((a, b) => b.count - a.count)[0];
                          return `Los ${maxDay.day.toLowerCase()}s ves más videos (${maxDay.count} en promedio).`;
                        })()}
                      </p>
                    </div>
                  </div>
                )}

                {stats.totalWatchTime && (
                  <div className={styles.insightCard}>
                    <div className={styles.insightIcon}>TIEMPO</div>
                    <div className={styles.insightContent}>
                      <h3>Tiempo total</h3>
                      <p>Has visto {stats.totalVideos} videos por un total de <strong>{stats.totalWatchTime}</strong>.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className={styles.footer}>
            <p className={styles.footerText}>
              Las estadísticas se actualizan automáticamente cada 5 minutos.
              {stats?.lastUpdated && (
                <span className={styles.lastUpdated}>
                  Última actualización: {new Date(stats.lastUpdated).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              )}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Statistics;