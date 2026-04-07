import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Hook para obtener un mapa de videos vistos para el usuario actual.
 *
 * Recibe:
 *  - userId: string | null
 *  - videos: array de objetos de YouTube (como los que devuelve useVideos)
 *
 * Devuelve:
 *  - seenMap: { [videoId: string]: boolean }
 *  - loading: boolean
 *  - error: Error | null
 *
 * Estrategia:
 *  - Extrae todos los videoId de la lista de videos.
 *  - Los agrupa en batches de hasta 10 ids (límite de Firestore para "in").
 *  - Para cada batch hace una consulta a la colección "userVideosMeta":
 *      where('userId', '==', userId)
 *      where('videoId', 'in', batchIds)
 *  - Con los resultados construye un mapa { videoId: seen }.
 */
export default function useSeenMap(userId, videos) {
  const [seenMap, setSeenMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Si no hay usuario o no hay videos, reseteamos y salimos
    if (!userId || !Array.isArray(videos) || videos.length === 0) {
      setSeenMap({});
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchSeen = async () => {
      setLoading(true);
      setError(null);

      try {
        // Extraer IDs únicos de los videos (id o contentDetails.videoId)
        const ids = Array.from(
          new Set(
            videos
              .map((video) => video.id || video.contentDetails?.videoId || null)
              .filter(Boolean)
          )
        );

        if (ids.length === 0) {
          if (!cancelled) {
            setSeenMap({});
          }
          return;
        }

        // Firestore limita "in" a 10 elementos, así que hacemos batches de 10
        const batches = [];
        const batchSize = 10;
        for (let i = 0; i < ids.length; i += batchSize) {
          batches.push(ids.slice(i, i + batchSize));
        }

        const results = {};

        for (const batch of batches) {
          const q = query(
            collection(db, 'userVideosMeta'),
            where('userId', '==', userId),
            where('videoId', 'in', batch)
          );

          const snap = await getDocs(q);

          snap.forEach((docSnap) => {
            const data = docSnap.data();
            const vid = data.videoId;
            if (vid) {
              results[vid] = Boolean(data.seen);
            }
          });
        }

        if (!cancelled) {
          setSeenMap(results);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchSeen();

    return () => {
      cancelled = true;
    };
  }, [userId, videos]);

  return { seenMap, loading, error };
}