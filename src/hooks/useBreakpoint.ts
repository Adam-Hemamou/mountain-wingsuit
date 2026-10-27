import { useEffect, useState } from 'react';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

// Keep in sync with src/styles/_tokens.scss
const TABLET = '(min-width: 768px)';
const DESKTOP = '(min-width: 1200px)';

function read(): Breakpoint {
  if (window.matchMedia(DESKTOP).matches) return 'desktop';
  if (window.matchMedia(TABLET).matches) return 'tablet';
  return 'mobile';
}

export function useBreakpoint(): Breakpoint {
  const [bp, setBp] = useState<Breakpoint>(read);
  useEffect(() => {
    const queries = [TABLET, DESKTOP].map((q) => window.matchMedia(q));
    const update = () => setBp(read());
    queries.forEach((q) => q.addEventListener('change', update));
    return () => queries.forEach((q) => q.removeEventListener('change', update));
  }, []);
  return bp;
}
