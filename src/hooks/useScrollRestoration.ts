import { useEffect, useRef } from 'react';

import { useLocation } from 'react-router-dom';

export function useScrollRestoration(key: string) {
  const { pathname } = useLocation();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem(`scroll-${key}-${pathname}`);
    if (saved && scrollRef.current) {
      scrollRef.current.scrollTop = parseInt(saved, 10);
    }
  }, [pathname, key]);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    const handleScroll = () => {
      sessionStorage.setItem(
        `scroll-${key}-${pathname}`,
        String(element.scrollTop)
      );
    };

    element.addEventListener('scroll', handleScroll);
    return () => element.removeEventListener('scroll', handleScroll);
  }, [pathname, key]);

  return scrollRef;
}

