import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import { fetchUserPlaylists } from "../services/youtube";

function usePlaylists(maxResults = 50) {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const { getYoutubeToken, logout } = useAuth();

  const loadPlaylists = useCallback(async (forceTokenRefresh = false) => {
    let isMounted = true;

    try {
      setLoading(true);
      setError(null);

      // 1. Obtener el token de acceso de Google
      const token = await getYoutubeToken(forceTokenRefresh);

      // 2. Si no hay token, el usuario debe re-autenticarse
      if (!token) {
        await logout();
        return;
      }

      // 3. Llamada al servicio de YouTube para obtener las playlists (mine=true)
      const data = await fetchUserPlaylists(token, maxResults);

      if (isMounted) {
        if (data && data.items) {
          setPlaylists(data.items);
          setRetryCount(0); // Resetear contador de reintentos
        } else {
          setPlaylists([]);
        }
      }

    } catch (err) {
      // Manejar error 401 (token expirado)
      if (err.message?.includes('401') || 
          err.message?.includes('Unauthorized') ||
          err.message?.includes('invalid authentication credentials')) {
        
        if (isMounted) {
          if (retryCount < 1) {
            // Primer intento: intentar con token fresco
            setRetryCount(prev => prev + 1);
            setTimeout(() => loadPlaylists(true), 1000); // Reintentar con forceRefresh
            return;
          } else {
            // Segundo intento falló, cerrar sesión
            setError("Tu sesión expiró. Por favor, iniciá sesión nuevamente.");
            await logout();
          }
        }
      } else {
        // Otro tipo de error
        if (isMounted) setError(err.message || "Error desconocido");
      }
    } finally {
      if (isMounted) setLoading(false);
    }
  }, [maxResults, getYoutubeToken, logout, retryCount]);

  useEffect(() => {
    let isMounted = true;
    
    if (isMounted) {
      loadPlaylists();
    }

    return () => {
      isMounted = false;
    };
  }, [loadPlaylists]);

  return {
    playlists,
    loading,
    error,
    // Permite forzar recarga (con o sin refresh de token)
    refreshPlaylists: (forceTokenRefresh = false) => {
      setRetryCount(0);
      loadPlaylists(forceTokenRefresh);
    }
  };
}

export default usePlaylists;
