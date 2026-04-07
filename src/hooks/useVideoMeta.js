import { useEffect, useState, useCallback } from 'react';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Hook para manejar el metadata de un video de una playlist en Firestore.
 *
 * Maneja:
 * - estado "visto" (seen)
 * - puntuación (rating)
 *
 * Estructura sugerida del documento:
 * Colección: userPlaylistVideos
 * Doc ID: `${userId}_${playlistId}_${videoId}`
 *
 * Campos:
 * - userId: string
 * - playlistId: string
 * - videoId: string
 * - seen: boolean
 * - rating: number | null
 * - updatedAt: timestamp (serverTimestamp)
 */

export default function useVideoMeta({ userId, playlistId, videoId }) {
  const [seen, setSeen] = useState(false);
  const [rating, setRating] = useState(null); // number | null
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const isParamsReady = Boolean(userId && playlistId && videoId);

  const docRef =
    isParamsReady && db
      ? doc(db, 'userPlaylistVideos', `${userId}_${playlistId}_${videoId}`)
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
        const payload = {
          userId,
          playlistId,
          videoId,
          seen: Boolean(nextSeen),
          rating:
            typeof nextRating === 'number' ? nextRating : null,
          updatedAt: serverTimestamp(),
        };

        await setDoc(docRef, payload, { merge: true });

        setSeen(payload.seen);
        setRating(payload.rating);
      } catch (err) {
        setError(err);
      } finally {
        setSaving(false);
      }
    },
    [docRef, userId, playlistId, videoId]
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
    loading,
    saving,
    error,
    toggleSeen,
    updateRating,
    saveMeta, // por si quieres controlarlo manualmente
  };
}