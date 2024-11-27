import { useEffect, useMemo, useState } from 'react';

export function useIsInViewport(ref) {
  const [isIntersecting, setIsIntersecting] = useState(false);

  const observer = useMemo(
    () => typeof window !== 'undefined' && new IntersectionObserver(([entry]) => setIsIntersecting(entry.isIntersecting)),
    []
  );

  useEffect(() => {
    if (typeof window !== 'undefined') {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return isIntersecting;
}
