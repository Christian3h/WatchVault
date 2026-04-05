import { useState, useRef, useCallback } from 'react';
import Header from '../components/Header/Header';
import styles from './Dashboard.module.css';
import useVideos from '../hooks/useVideos';
import usePlaylists from '../hooks/usePlaylists';
import { auth } from '../firebase';

/**
 * Dashboard principal de WatchVault con Scroll Infinito.
 */
function Dashboard() {
  const [selectedId, setSelectedId] = useState('');

  // Hooks de datos
  const { playlists, loading: loadingPlaylists } = usePlaylists();
  const { videos, loading: loadingVideos, error, hasMore, loadMore } = useVideos(selectedId);

  if (videos.length > 0) console.log("Un video de ejemplo:", videos[0]);
  // Referencia para el Intersection Observer (Scroll Infinito)
  const observer = useRef();

  /**
   * Ref callback que se asigna al último elemento de la lista.
   * Cuando este elemento entra en el viewport, dispara loadMore().
   */
  const lastVideoElementRef = useCallback(node => {
    if (loadingVideos) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    });

    if (node) observer.current.observe(node);
  }, [loadingVideos, hasMore, loadMore]);

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

          <div className={styles.grid}>
            {videos.map((video, index) => {
              // Si es el último video del array actual, le asignamos la Ref del Observer
              const isLastElement = videos.length === index + 1;

              return (
                <article
                  key={`${video.id}-${index}`}
                  ref={isLastElement ? lastVideoElementRef : null}
                  className={styles.card}
                >
                  <img
                    src={video.snippet.thumbnails.high?.url || video.snippet.thumbnails.medium?.url}
                    alt={video.snippet.title}
                    loading="lazy"
                  />
                  <div className={styles.videoDetails}>
                    <h3>{video.snippet.title}</h3>
                    <p>{video.snippet.channelTitle}</p>
                  </div>
                </article>
              );
            })}
          </div>

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
