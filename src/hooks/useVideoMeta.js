import { useEffect, useState, useCallback } from 'react';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Hook para manejar el metadata de un video en Firestore.
 *
 * Maneja:
 * - estado "visto" (seen)
 * - puntuación (rating)
 * - duración total del video (durationSeconds)
 * - tiempo visto acumulado (watchedSeconds)
 *
 * Colección: userVideosMeta
 * Doc ID: `${userId}_${videoId}`
 */

export default function useVideoMeta({
  userId,
  videoId,
  durationSeconds,
  title,
  channel,
  thumbnail,
  rawDuration,
}) {
  const [seen, setSeen] = useState(false);
  const [rating, setRating] = useState(null); // number | null
  const [watchedSeconds, setWatchedSeconds] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const isParamsReady = Boolean(userId && videoId);

  const docRef =
    isParamsReady && db
      ? doc(db, 'userVideosMeta', `${userId}_${videoId}`)
      : null;

  // Cargar metadata inicial desde Firestore
  useEffect(() => {
    if (!docRef) {
      // Si faltan parámetros, reseteamos a valores por defecto
      setSeen(false);
      setRating(null);
      setError(null);
      return;
    }

    let isCancelled = false;

    const fetchMeta = async () => {
      setLoading(true);
      setError(null);

      try {
        const snap = await getDoc(docRef);

        if (!isCancelled) {
          if (snap.exists()) {
            const data = snap.data();
            setSeen(Boolean(data.seen));
            setRating(
              typeof data.rating === 'number' ? data.rating : null
            );
            setWatchedSeconds(
              typeof data.watchedSeconds === 'number' ? data.watchedSeconds : 0
            );
          } else {
            // No hay documento todavía, usar valores por defecto
            setSeen(false);
            setRating(null);
          }
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchMeta();

    return () => {
      isCancelled = true;
    };
  }, [docRef]);

  const saveMeta = useCallback(
    async (nextSeen, nextRating) => {
      if (!docRef) return;

      setSaving(true);
      setError(null);

      try {
        const nextSeenBool = Boolean(nextSeen);

        const payload = {
          userId,
          videoId,
          seen: nextSeenBool,
          rating:
            typeof nextRating === 'number' ? nextRating : null,
          // Datos visuales básicos del video para poder reconstruir la tarjeta
          title: title || null,
          channel: channel || null,
          thumbnail: thumbnail || null,
          rawDuration: rawDuration || null,
          // Si se marca como visto y tenemos duración, usamos esa duración
          watchedSeconds:
            nextSeenBool && typeof durationSeconds === 'number'
              ? durationSeconds
              : watchedSeconds,
          updatedAt: serverTimestamp(),
        };

        await setDoc(docRef, payload, { merge: true });

        setSeen(payload.seen);
        setRating(payload.rating);
        setWatchedSeconds(payload.watchedSeconds || 0);
      } catch (err) {
        setError(err);
      } finally {
        setSaving(false);
      }
    },
    [docRef, userId, videoId, durationSeconds, watchedSeconds, title, channel, thumbnail, rawDuration]
  );

  const toggleSeen = useCallback(() => {
    saveMeta(!seen, rating);
  }, [saveMeta, seen, rating]);

  const updateRating = useCallback(
    newRating => {
      const parsed =
        typeof newRating === 'string'
          ? parseInt(newRating, 10)
          : newRating;

      if (
        typeof parsed === 'number' &&
        !Number.isNaN(parsed) &&
        parsed >= 1 &&
        parsed <= 5
      ) {
        saveMeta(seen, parsed);
      } else {
        // Si la puntuación no es válida, se guarda como null
        saveMeta(seen, null);
      }
    },
    [saveMeta, seen]
  );

  return {
    seen,
    rating,
    watchedSeconds,
    loading,
    saving,
    error,
    toggleSeen,
    updateRating,
    saveMeta, // por si quieres controlarlo manualmente
  };
}