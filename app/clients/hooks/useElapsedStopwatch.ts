import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Focused elapsed-time state for the combined and study stopwatch routes.
 * Existing stopwatch pages intentionally keep their established timing engines.
 */
export function useElapsedStopwatch() {
  const [running, setRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);

  const runningRef = useRef(false);
  const elapsedRef = useRef(0);
  const baseRef = useRef(0);
  const startedAtRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);

  const stopFrame = useCallback(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, []);

  const readElapsed = useCallback(() => {
    if (!runningRef.current || startedAtRef.current === null) {
      return elapsedRef.current;
    }

    return baseRef.current + (performance.now() - startedAtRef.current);
  }, []);

  const updateElapsed = useCallback(() => {
    const next = Math.max(0, readElapsed());
    elapsedRef.current = next;
    setElapsedMs(next);
    return next;
  }, [readElapsed]);

  useEffect(() => {
    if (!running) {
      stopFrame();
      return;
    }

    const tick = () => {
      updateElapsed();
      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return stopFrame;
  }, [running, stopFrame, updateElapsed]);

  useEffect(() => {
    const reconcileVisibleTime = () => {
      if (document.visibilityState === "visible" && runningRef.current) {
        updateElapsed();
      }
    };

    document.addEventListener("visibilitychange", reconcileVisibleTime);
    return () => {
      document.removeEventListener("visibilitychange", reconcileVisibleTime);
      stopFrame();
    };
  }, [stopFrame, updateElapsed]);

  const start = useCallback(() => {
    if (runningRef.current) return;
    baseRef.current = elapsedRef.current;
    startedAtRef.current = performance.now();
    runningRef.current = true;
    setRunning(true);
  }, []);

  const pause = useCallback(() => {
    if (!runningRef.current) return;
    const next = Math.max(0, readElapsed());
    elapsedRef.current = next;
    baseRef.current = next;
    startedAtRef.current = null;
    runningRef.current = false;
    setElapsedMs(next);
    setRunning(false);
  }, [readElapsed]);

  const toggle = useCallback(() => {
    if (runningRef.current) pause();
    else start();
  }, [pause, start]);

  const reset = useCallback(() => {
    runningRef.current = false;
    elapsedRef.current = 0;
    baseRef.current = 0;
    startedAtRef.current = null;
    setRunning(false);
    setElapsedMs(0);
    stopFrame();
  }, [stopFrame]);

  return {
    running,
    elapsedMs,
    readElapsed,
    start,
    pause,
    toggle,
    reset,
  };
}
