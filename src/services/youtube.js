const BASE_URL = 'https://www.googleapis.com/youtube/v3';

/**
 * Obtiene los elementos (videos) de una lista de reproducción específica.
 * Proporciona el ID del video y fragmentos de información básica.
 * Soporta paginación mediante pageToken.
 */
export async function fetchPlaylistItems(playlistId, accessToken, maxResults = 50, pageToken = null) {
  try {
    const params = new URLSearchParams({
      part: 'snippet,contentDetails',
      playlistId,
      maxResults,
      ...(pageToken && { pageToken }),
    });

    const response = await fetch(`${BASE_URL}/playlistItems?${params}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Error al obtener items de la playlist');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Obtiene detalles extendidos de una lista de IDs de videos (hasta 50).
 * Incluye duración, estadísticas y etiquetas.
 */
export async function fetchVideoDetails(videoIds, accessToken) {
  try {
    const params = new URLSearchParams({
      part: 'snippet,contentDetails,statistics',
      id: videoIds.join(','),
    });

    const response = await fetch(`${BASE_URL}/videos?${params}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Error al obtener detalles de videos');
    }

    const data = await response.json();
    return data.items;
  } catch (error) {
    throw error;
  }
}

/**
 * Obtiene todas las listas de reproducción del usuario autenticado.
 */
export async function fetchUserPlaylists(accessToken, maxResults = 50) {
  try {
    const params = new URLSearchParams({
      part: 'snippet,contentDetails',
      mine: 'true',
      maxResults,
    });

    const response = await fetch(`${BASE_URL}/playlists?${params}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Error al obtener las playlists del usuario');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}