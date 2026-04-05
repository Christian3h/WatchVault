import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "./useAuth";
import { fetchPlaylistItems, fetchVideoDetails } from "../services/youtube";

/**
 * Custom Hook para gestionar la obtención de videos de YouTube con soporte para scroll infinito.
 *
 * @param {string} playlistId - ID de la playlist a consultar.
 */
function useVideos(playlistId) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [nextPageToken, setNextPageToken] = useState(null);

  const { getYoutubeToken, logout } = useAuth();

  // Referencia para evitar colisiones si se cambia de playlist rápido
  const currentPlaylistIdRef = useRef(playlistId);

  /**
   * Función principal para cargar una página de videos.
   * @param {string|null} token - Token de la siguiente página (opcional).
   * @param {boolean} isInitialLoad - Si es la primera carga de una playlist.
   */
  const loadVideos = useCallback(async (token = null, isInitialLoad = false) => {
    if (!playlistId) return;

    try {
      setLoading(true);
      setError(null);

      const youtubeToken = await getYoutubeToken();
      if (!youtubeToken) {
        await logout();
        return;
      }

      // 1. Obtener IDs de los videos (Paginado)
      const data = await fetchPlaylistItems(playlistId, youtubeToken, 50, token);

      if (!data || !data.items || data.items.length === 0) {
        if (isInitialLoad) setVideos([]);
        setNextPageToken(null);
        return;
      }

      // Guardamos el token de la siguiente página para el scroll infinito
      setNextPageToken(data.nextPageToken || null);

      // 2. Obtener detalles completos de los videos (duración, stats, etc.)
      const videoIds = data.items.map(item => item.contentDetails.videoId);

      // La API de videos permite hasta 50 IDs separados por coma
      const detailedVideos = await fetchVideoDetails(videoIds, youtubeToken);

      // 3. Actualizar el estado sumando los nuevos videos a los anteriores
      setVideos(prev => isInitialLoad ? detailedVideos : [...prev, ...detailedVideos]);

    } catch (err) {
      console.error("Error cargando videos:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [playlistId, getYoutubeToken, logout]);

  // Efecto para resetear y cargar cuando cambia la playlist
  useEffect(() => {
    currentPlaylistIdRef.current = playlistId;
    setVideos([]);
    setNextPageToken(null);

    if (playlistId) {
      loadVideos(null, true);
    }
  }, [playlistId, loadVideos]);

  /**
   * Función que llama el Dashboard para cargar más contenido (Scroll Infinito).
   */
  const loadMore = useCallback(() => {
    if (nextPageToken && !loading) {
      loadVideos(nextPageToken, false);
    }
  }, [nextPageToken, loading, loadVideos]);

  return {
    videos,
    loading,
    error,
    hasMore: !!nextPageToken,
    loadMore
  };
}

export default useVideos;
