import { useEffect, useState, useCallback } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Hook para recordar la playlist seleccionada por usuario.
 *
 * Lee y guarda el campo `defaultPlaylistId` en el documento:
 *   users/<userId>
 *
 * Uso:
 *   const userId = auth.currentUser?.uid || null;
 *   const { defaultPlaylistId, saveDefaultPlaylistId, loading } = useDefaultPlaylist(userId);
 */
export default function useDefaultPlaylist(userId) {
  const [defaultPlaylistId, setDefaultPlaylistId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar la playlist por defecto desde Firestore
  useEffect(() => {
    if (!userId || !db) {
      setDefaultPlaylistId('');
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchDefault = async () => {
      setLoading(true);
      setError(null);

      try {
        const userRef = doc(db, 'users', userId);
        const snap = await getDoc(userRef);

        if (!cancelled && snap.exists()) {
          const data = snap.data();
          setDefaultPlaylistId(data.defaultPlaylistId || '');
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

    fetchDefault();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Guardar cambios de playlist por defecto en Firestore
  const saveDefaultPlaylistId = useCallback(
    async (playlistId) => {
      if (!userId || !db) return;

      setDefaultPlaylistId(playlistId);
      setError(null);

      try {
        const userRef = doc(db, 'users', userId);
        await setDoc(
          userRef,
          { defaultPlaylistId: playlistId || '' },
          { merge: true }
        );
       } catch (err) {
        setError(err);
      }
    },
    [userId]
  );

  return {
    defaultPlaylistId,
    saveDefaultPlaylistId,
    loading,
    error,
  };
}