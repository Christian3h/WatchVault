import styles from './VideoGrid.module.css';
import VideoItem from '../VideoItem/VideoItem';

export default function VideoGrid({ videos, lastVideoRef, onVideoClick }) {
  return (
    <div className={styles.videoGrid}>
      {videos.map((video, index) => {
        const isLastElement = index === videos.length - 1;
        const baseId =
          video.contentDetails?.videoId ||
          video.id ||
          video.snippet?.title ||
          'video';
        const key = `${baseId}-${index}`;

        return (
          <VideoItem
            key={key}
            innerRef={isLastElement ? lastVideoRef : null}
            title={video.snippet.title}
            channel={video.snippet.channelTitle}
            duration={video.contentDetails.duration}
            thumbnail={video.snippet.thumbnails.medium.url}
            onClick={onVideoClick ? () => onVideoClick(video) : undefined}
          />
        );
      })}
    </div>
  );
}
