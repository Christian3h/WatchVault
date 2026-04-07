import { useState } from 'react';
import Header from '../components/Header/Header';
import styles from './Dashboard.module.css';
import useVideos from '../hooks/useVideos';
import usePlaylists from '../hooks/usePlaylists';
import { auth } from '../firebase';
import VideoGrid from '../components/VideoGrid/VideoGrid';
import useInfiniteScroll from '../hooks/useInfiniteScroll';
import VideoModal from '../components/VideoModal/VideoModal';
import useSeenMap from '../hooks/useSeenMap';

function Dashboard() {
  const [selectedId, setSelectedId] = useState('');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState('unseen'); // 'all' | 'unseen' | 'seen'

  // Hooks de datos
  const { playlists, loading: loadingPlaylists } = usePlaylists();
  const { videos, loading: loadingVideos, error, hasMore, loadMore } = useVideos(selectedId);

  const userId = auth.currentUser?.uid || null;
  const { seenMap } = useSeenMap(userId, videos);

  const filteredVideos = videos.filter((video) => {
    const id = video.id || video.contentDetails?.videoId || null;
    const seen = id ? seenMap[id] : false;

    if (filter === 'unseen') return !seen;
    if (filter === 'seen') return !!seen;
    return true; // 'all'
  });

  const { lastElementRef: lastVideoElementRef } = useInfiniteScroll({
    loading: loadingVideos,
    hasMore,
    onLoadMore: loadMore,
  });

  const handleVideoClick = (video) => {
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
            onChange={(e) => setSelectedId(e.target.value)}
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

          {loadingVideos && (
            <div className={styles.loadingText}>
              Analizando videos de la bóveda...
            </div>
          )}

          {!selectedId && !loadingVideos && (
            <div className={styles.loadingText}>
              Selecciona una lista arriba para ver tus videos.
            </div>
          )}

          {selectedId && videos.length === 0 && !loadingVideos && (
            <div className={styles.loadingText}>
              No se encontraron videos en esta lista.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
