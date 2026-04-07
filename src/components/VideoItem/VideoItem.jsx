import React from 'react';
import styles from './VideoItem.module.css';

function parseVideoDuration(duration) {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  const hours = match[1] ? parseInt(match[1], 10) : 0;
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const seconds = match[3] ? parseInt(match[3], 10) : 0;
  if(seconds == 0 && hours == 0) return `${minutes}`;
  if(hours == 0) return `${minutes}:${seconds}`;
  if(minutes == 0) return `${hours}:${seconds}`;
  if(seconds == 0) return `${hours}:${minutes}`;
  return `${hours}:${minutes}:${seconds}`;
}

export default function VideoItem({ title, channel, duration, thumbnail, innerRef }) {
  return (
    <div className={styles.videoItem} ref={innerRef}>
      <div className={styles.thumbnail}>
        <img src={thumbnail} alt={title}/>
        <p>{parseVideoDuration(duration)}</p>
      </div>
      <h3>{title}</h3>
      <p className={styles.channel}>{channel}</p>
    </div>
  );
}
