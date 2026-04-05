import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { fetchUserPlaylists } from "../services/youtube";

function usePlaylists(maxResults = 50) {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { getYoutubeToken, logout } = useAuth();

  useEffect(() => {
    let isMounted = true;

    async function loadPlaylists() {
      try {
        setLoading(true);
        setError(null);

        // 1. Obtener el token de acceso de Google
        const token = await getYoutubeToken();

        // 2. Si no hay token, el usuario debe re-autenticarse
        if (!token) {
          console.warn("No se encontró token para cargar playlists. Cerrando sesión...");
          await logout();
          return;
        }

        // 3. Llamada al servicio de YouTube para obtener las playlists (mine=true)
        const data = await fetchUserPlaylists(token, maxResults);

        if (isMounted) {
          if (data && data.items) {
            setPlaylists(data.items);
          } else {
            setPlaylists([]);
          }
        }

      } catch (err) {
        console.error("Error cargando las playlists del usuario:", err);
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadPlaylists();

    return () => {
      isMounted = false;
    };
  }, [maxResults, getYoutubeToken, logout]);

  return {
    playlists,
    loading,
    error,
    // Permite al Dashboard forzar una recarga si el usuario crea una nueva lista
    refreshPlaylists: () => setLoading(true)
  };
}

export default usePlaylists;
