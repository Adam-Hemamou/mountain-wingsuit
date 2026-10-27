import { useEffect, useReducer, useRef } from 'react';
import { NEXT_ROUND_MS, drawCrashPoint, initialState, multAt, reducer } from './engine';

/** Local, backend-free game loop: rAF drives the multiplier while FLYING. */
export function useGame() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { phase, autoPlay, infinite, left } = state;

  // Multiplier loop.
  const raf = useRef(0);
  useEffect(() => {
    if (phase !== 'FLYING') return;
    const t0 = performance.now();
    const loop = (now: number) => {
      dispatch({ type: 'TICK', mult: multAt(now - t0) });
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, [phase]);

  // Auto Play: queue the next jump once a round has ended.
  useEffect(() => {
    if (!autoPlay || (phase !== 'CASHED_OUT' && phase !== 'CRASHED')) return;
    const id = window.setTimeout(() => {
      if (infinite || left > 0) dispatch({ type: 'START', fromAuto: true, crashAt: drawCrashPoint() });
      else dispatch({ type: 'SET_AUTO_PLAY', value: false });
    }, NEXT_ROUND_MS);
    return () => window.clearTimeout(id);
  }, [phase, autoPlay, infinite, left]);

  const jump = () => dispatch({ type: 'START', fromAuto: false, crashAt: drawCrashPoint() });

  return { state, dispatch, jump };
}
