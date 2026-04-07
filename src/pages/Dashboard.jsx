import { useState } from 'react';
import Header from '../components/Header/Header';
import styles from './Dashboard.module.css';
import useVideos from '../hooks/useVideos';
import usePlaylists from '../hooks/usePlaylists';
import { auth } from '../firebase';
import VideoGrid from '../components/VideoGrid/VideoGrid';
import useInfiniteScroll from '../hooks/useInfiniteScroll';

function Dashboard() {
  const [selectedId, setSelectedId] = useState('');

  // Hooks de datos
  const { playlists, loading: loadingPlaylists } = usePlaylists();
  const { videos, loading: loadingVideos, error, hasMore, loadMore } = useVideos(selectedId);

  // Hook de scroll infinito basado en IntersectionObserver
  const { lastElementRef: lastVideoElementRef } = useInfiniteScroll({
    loading: loadingVideos,
    hasMore,
    onLoadMore: loadMore,
  });

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
        </section>

        <section className={styles.content}>
          {error && (
            <div className={styles.errorText}>
              <p>⚠️ Error: {error}</p>
            </div>
          )}


          <VideoGrid videos={videos} lastVideoRef={lastVideoElementRef} />

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
