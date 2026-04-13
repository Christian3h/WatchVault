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
  const [retryCount, setRetryCount] = useState(0);

  const { getYoutubeToken, logout } = useAuth();

  // Referencia para evitar colisiones si se cambia de playlist rápido
  const currentPlaylistIdRef = useRef(playlistId);

  /**
   * Función principal para cargar una página de videos.
   * @param {string|null} token - Token de la siguiente página (opcional).
   * @param {boolean} isInitialLoad - Si es la primera carga de una playlist.
   * @param {boolean} forceTokenRefresh - Si se debe forzar renovación de token.
   */
  const loadVideos = useCallback(async (token = null, isInitialLoad = false, forceTokenRefresh = false) => {
    if (!playlistId) return;

    try {
      setLoading(true);
      setError(null);

      const youtubeToken = await getYoutubeToken(forceTokenRefresh);
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
      setRetryCount(0); // Resetear contador de reintentos

    } catch (err) {
      // Manejar error 401 (token expirado)
      if (err.message?.includes('401') || 
          err.message?.includes('Unauthorized') ||
          err.message?.includes('invalid authentication credentials')) {
        
        if (retryCount < 1) {
          // Primer intento: intentar con token fresco
          setRetryCount(prev => prev + 1);
          setTimeout(() => loadVideos(token, isInitialLoad, true), 1000); // Reintentar con forceRefresh
          return;
        } else {
          // Segundo intento falló, cerrar sesión
          setError("Tu sesión expiró. Por favor, iniciá sesión nuevamente.");
          await logout();
        }
      } else {
        // Otro tipo de error
        setError(err.message || "Error desconocido");
      }
    } finally {
      setLoading(false);
    }
  }, [playlistId, getYoutubeToken, logout, retryCount]);

  // Efecto para resetear y cargar cuando cambia la playlist
  useEffect(() => {
    currentPlaylistIdRef.current = playlistId;
    setVideos([]);
    setNextPageToken(null);
    setRetryCount(0);

    if (playlistId) {
      loadVideos(null, true, false);
    }
  }, [playlistId, loadVideos]);

  /**
   * Función que llama el Dashboard para cargar más contenido (Scroll Infinito).
   */
  const loadMore = useCallback(() => {
    if (nextPageToken && !loading) {
      loadVideos(nextPageToken, false, false);
    }
  }, [nextPageToken, loading, loadVideos]);

  return {
    videos,
    loading,
    error,
    hasMore: !!nextPageToken,
    loadMore,
    // Para forzar recarga con nuevo token si es necesario
    refreshVideos: () => {
      setRetryCount(0);
      loadVideos(null, true, false);
    }
  };
}

export default useVideos;
