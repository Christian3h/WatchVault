import { useRef, useCallback } from 'react';

export default function useInfiniteScroll({ loading, hasMore, onLoadMore }) {
  const observerRef = useRef(null);

  const lastElementRef = useCallback(
    node => {
      if (loading) return;

      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      observerRef.current = new IntersectionObserver(entries => {
        const firstEntry = entries[0];

        if (firstEntry.isIntersecting && hasMore) {
          onLoadMore();
        }
      });

      if (node) {
        observerRef.current.observe(node);
      }
    },
    [loading, hasMore, onLoadMore]
  );

  return {
    lastElementRef,
  };
}