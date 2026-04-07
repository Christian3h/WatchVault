import React, { useEffect } from 'react';
import styles from './VideoModal.module.css';
import Button from '../Button/Button';
import { auth } from '../../firebase';
import useVideoMeta from '../../hooks/useVideoMeta';

function parseVideoDuration(duration) {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  const hours = match?.[1] ? parseInt(match[1], 10) : 0;
  const minutes = match?.[2] ? parseInt(match[2], 10) : 0;
  const seconds = match?.[3] ? parseInt(match[3], 10) : 0;

  if (seconds === 0 && hours === 0) return `${minutes}`;
  if (hours === 0) return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  if (minutes === 0) return `${hours}:${seconds.toString().padStart(2, '0')}`;
  if (seconds === 0) return `${hours}:${minutes.toString().padStart(2, '0')}`;
  return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;
}

function durationToSeconds(duration) {
  if (!duration) return 0;
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return 0;
  const hours = match[1] ? parseInt(match[1], 10) : 0;
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const seconds = match[3] ? parseInt(match[3], 10) : 0;
  return hours * 3600 + minutes * 60 + seconds;
}

export default function VideoModal({ isOpen, video, /*playlistId,*/ onClose }) {
  // 1) Hooks siempre primero y en el mismo orden
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  const userId = auth.currentUser?.uid || null;
  const videoId = video?.id || video?.contentDetails?.videoId || null;
  const rawDuration = video?.contentDetails?.duration || '';
  const durationSeconds = durationToSeconds(rawDuration);

  const title = video?.snippet?.title || '';
  const channel = video?.snippet?.channelTitle || '';
  const thumbnail =
    video?.snippet?.thumbnails?.high?.url ||
    video?.snippet?.thumbnails?.medium?.url ||
    '';
  const formattedDuration = rawDuration ? parseVideoDuration(rawDuration) : '';
  const description = video?.snippet?.description || '';

  const {
    seen,
    rating,
    toggleSeen,
    updateRating,
  } = useVideoMeta({
    userId,
    videoId,
    durationSeconds,
    title,
    channel,
    thumbnail,
    rawDuration,
  });

  // 2) Después de los hooks, early return de render
  if (!isOpen || !video) return null;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <Button
          type="button"
          variant="alert"
          size="small"
          className={styles.closeButton}
          onClick={onClose}
        >
          ×
        </Button>

        <div className={styles.header}>
          {thumbnail && (
            <img
              src={thumbnail}
              alt={title}
              className={styles.thumbnail}
            />
          )}
          <div className={styles.description_header}>
            <h2>{title}</h2>
            <p className={styles.channel}>{channel}</p>
            {formattedDuration && (
              <p className={styles.duration}>Duración: {formattedDuration}</p>
            )}
          </div>
        </div>

        {description && (
          <div className={styles.section}>
            <h3>Descripción</h3>
            <p className={styles.description}>{description}</p>
          </div>
        )}

        {videoId && (
          <div className={styles.section}>
            <Button
              type="button"
              variant="normal"
              size="small"
              onClick={() => {
                const url = `https://www.youtube.com/watch?v=${videoId}`;
                window.open(url, '_blank', 'noopener,noreferrer');
              }}
            >
              Ver en YouTube
            </Button>
          </div>
        )}

        <div className={styles.section}>
          <h3>Estado</h3>
          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={!!seen}
              onChange={toggleSeen}
              disabled={!userId}
            />
            <span>Ya lo vi</span>
          </label>
        </div>

        <div className={styles.section}>
          <h3>Puntuación</h3>
          <select
            className={styles.select}
            value={rating ?? ''}
            onChange={(e) => updateRating(e.target.value)}
            disabled={!userId}
          >
            <option value="">Sin puntuación</option>
            <option value="1">1 - Muy malo</option>
            <option value="2">2 - Malo</option>
            <option value="3">3 - Normal</option>
            <option value="4">4 - Bueno</option>
            <option value="5">5 - Excelente</option>
          </select>
        </div>
      </div>
    </div>
  );
}
