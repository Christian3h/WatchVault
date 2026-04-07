import { useState, useEffect } from 'react';
import Header from '../components/Header/Header';
import styles from './Dashboard.module.css';
import useVideos from '../hooks/useVideos';
import usePlaylists from '../hooks/usePlaylists';
import { auth } from '../firebase';
import VideoGrid from '../components/VideoGrid/VideoGrid';
import useInfiniteScroll from '../hooks/useInfiniteScroll';
import VideoModal from '../components/VideoModal/VideoModal';
import useSeenMap from '../hooks/useSeenMap';
import useSeenVideosList from '../hooks/useSeenVideosList';
import useDefaultPlaylist from '../hooks/useDefaultPlaylist';

function Dashboard() {
  const userId = auth.currentUser?.uid || null;
  const { defaultPlaylistId, saveDefaultPlaylistId } = useDefaultPlaylist(userId);

  const [selectedId, setSelectedId] = useState(defaultPlaylistId || '');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState('unseen'); // 'all' | 'unseen' | 'seen'

  // Sincronizar selectedId cuando se cargue defaultPlaylistId desde Firestore
  useEffect(() => {
    if (defaultPlaylistId && !selectedId) {
      setSelectedId(defaultPlaylistId);
    }
  }, [defaultPlaylistId, selectedId]);

  // Hooks de datos
  const { playlists, loading: loadingPlaylists } = usePlaylists();
  const { videos, loading: loadingVideos, error, hasMore, loadMore } = useVideos(selectedId);

  const { seenMap } = useSeenMap(userId, videos);
  const {
    videos: seenVideos,
    loading: loadingSeenVideos,
    error: errorSeenVideos,
  } = useSeenVideosList(userId);

  const filteredVideos = (() => {
    if (filter === 'seen') {
      // Usar solo datos de Firebase cuando el filtro es "solo vistos"
      return seenVideos.map((item) => ({
        id: item.videoId,
        snippet: {
          title: item.title || 'Video visto',
          channelTitle: item.channel || '',
          thumbnails: {
            medium: { url: item.thumbnail || '' },
            high: { url: item.thumbnail || '' },
          },
          description: '',
        },
        contentDetails: {
          duration: item.rawDuration || '',
          videoId: item.videoId,
        },
      }));
    }

    // Para "unseen" y "all" usamos la lista de YouTube filtrada por seenMap
    return videos.filter((video) => {
      const id = video.id || video.contentDetails?.videoId || null;
      const seen = id ? seenMap[id] : false;

      if (filter === 'unseen') return !seen;
      if (filter === 'seen') return !!seen;
      return true; // 'all'
    });
  })();

  const { lastElementRef: lastVideoElementRef } = useInfiniteScroll({
    loading: loadingVideos,
    hasMore,
    onLoadMore: loadMore,
  });

  const handleVideoClick = (video) => {
    // Evitamos abrir el modal si no hay playlist seleccionada,
    // ya que la metadata de visto se guarda por playlistId
    if (!selectedId) return;
    setSelectedVideo(video);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedVideo(null);
  };

  return (
    <div className={styles.dashboardWrapper}>
      <Header />

      <main className={styles.container}>
        <section className={styles.welcome}>
          <h1>Mi Bóveda</h1>
          <p>
            Bienvenido, <strong>{auth.currentUser?.displayName || 'Usuario'}</strong>
          </p>

          <select
            onChange={(e) => {
              const value = e.target.value;
              setSelectedId(value);
              saveDefaultPlaylistId(value);
            }}
            value={selectedId}
            disabled={loadingPlaylists}
          >
            <option value="">-- Selecciona una Playlist --</option>
            {playlists.map(playlist => (
              <option key={playlist.id} value={playlist.id}>
                {playlist.snippet.title} ({playlist.contentDetails?.itemCount || 0})
              </option>
            ))}
          </select>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="unseen">Solo no vistos</option>
            <option value="all">Todos</option>
            <option value="seen">Solo vistos</option>
          </select>
        </section>

        <section className={styles.content}>
          {error && (
            <div className={styles.errorText}>
              <p>⚠️ Error: {error}</p>
            </div>
          )}

          {errorSeenVideos && filter === 'seen' && (
            <div className={styles.errorText}>
              <p>⚠️ Error cargando videos vistos: {String(errorSeenVideos)}</p>
            </div>
          )}

          <VideoGrid
            videos={filteredVideos}
            lastVideoRef={lastVideoElementRef}
            onVideoClick={handleVideoClick}
          />

          <VideoModal
            isOpen={isModalOpen}
            video={selectedVideo}
            playlistId={selectedId}
            onClose={handleCloseModal}
          />

          {(loadingVideos && filter !== 'seen') && (
            <div className={styles.loadingText}>
              Analizando videos de la bóveda...
            </div>
          )}

          {(loadingSeenVideos && filter === 'seen') && (
            <div className={styles.loadingText}>
              Cargando videos vistos desde tu bóveda...
            </div>
          )}

          {!selectedId && !loadingVideos && filter !== 'seen' && (
            <div className={styles.loadingText}>
              Selecciona una lista arriba para ver tus videos.
            </div>
          )}

          {filter !== 'seen' && selectedId && videos.length === 0 && !loadingVideos && (
            <div className={styles.loadingText}>
              No se encontraron videos en esta lista.
            </div>
          )}

          {filter === 'seen' && !loadingSeenVideos && filteredVideos.length === 0 && (
            <div className={styles.loadingText}>
              Aún no has marcado videos como vistos.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
