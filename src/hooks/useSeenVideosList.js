import { useEffect, useState } from 'react';
import {
  collection,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Hook para obtener la lista de videos vistos desde Firestore.
 *
 * Lee de la colección `userVideosMeta` todos los documentos del usuario
 * donde `seen === true`, utilizando únicamente datos almacenados en Firebase
 * (sin consultar la API de YouTube).
 *
 * Devuelve:
 *  - videos: array de objetos con la forma:
 *      {
 *        videoId: string,
 *        title: string | null,
 *        channel: string | null,
 *        thumbnail: string | null,
 *        rawDuration: string | null,      // ej: "PT15M20S"
 *        watchedSeconds: number,          // duración total o acumulada
 *        rating: number | null,
 *        lastWatchedAt: Date | null      // convertido desde Timestamp
 *      }
 *  - loading: boolean
 *  - error: Error | null
 */
export default function useSeenVideosList(userId) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Si no hay usuario, limpiamos y no hacemos nada.
    if (!userId || !db) {
      setVideos([]);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    const q = query(
      collection(db, 'userVideosMeta'),
      where('userId', '==', userId),
      where('seen', '==', true)
    );

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const items = snap.docs.map((docSnap) => {
          const data = docSnap.data();
          const ts = data.updatedAt;

          return {
            videoId: data.videoId || null,
            title: data.title ?? null,
            channel: data.channel ?? null,
            thumbnail: data.thumbnail ?? null,
            rawDuration: data.rawDuration ?? null,
            watchedSeconds:
              typeof data.watchedSeconds === 'number'
                ? data.watchedSeconds
                : 0,
            rating:
              typeof data.rating === 'number' ? data.rating : null,
            lastWatchedAt:
              ts && typeof ts.toDate === 'function'
                ? ts.toDate()
                : null,
          };
        });

        setVideos(items);
        setError(null);
        setLoading(false);
      },
       (err) => {
        // Si el índice aún se está construyendo u otra precondición falla,
        // devolvemos lista vacía sin propagar el error a la UI.
        if (err && err.code === 'failed-precondition') {
          setVideos([]);
          setError(null);
        } else {
          setVideos([]);
          setError(err);
        }
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [userId]);

  return { videos, loading, error };
}