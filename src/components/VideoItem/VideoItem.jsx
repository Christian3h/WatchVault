import React from 'react';
import styles from './VideoItem.module.css';

function parseVideoDuration(duration) {
  if (!duration || typeof duration !== 'string') return '';

  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return '';

  const hours = match[1] ? parseInt(match[1], 10) : 0;
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const seconds = match[3] ? parseInt(match[3], 10) : 0;

  if (seconds === 0 && hours === 0) return `${minutes}`;
  if (hours === 0) return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  if (minutes === 0) return `${hours}:${seconds.toString().padStart(2, '0')}`;
  if (seconds === 0) return `${hours}:${minutes.toString().padStart(2, '0')}`;
  return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;
}

function truncateTitle(title, maxLength = 50) {
  if (!title) return '';
  if (title.length <= maxLength) return title;
  return `${title.slice(0, maxLength)}...`;
}

export default function VideoItem({ title, channel, duration, thumbnail, innerRef, onClick }) {
  return (
    <div className={styles.videoItem} ref={innerRef} onClick={onClick}>
      <div className={styles.thumbnail}>
        <img src={thumbnail} alt={title}/>
        <p>{parseVideoDuration(duration)}</p>
      </div>
      <h3>{truncateTitle(title)}</h3>
      <p className={styles.channel}>{channel}</p>
    </div>
  );
}
