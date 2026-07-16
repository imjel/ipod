import { useEffect, useRef } from "react";
import { formatTime } from "~/lib/formatTime";

export interface UsePlaybackProgressArgs {
  positionMs: number;
  durationMs: number;
  isPlaying: boolean;
  trackUri: string | null;
}

export type UsePlaybackProgressReturn = {
  ref: React.RefObject<HTMLDivElement | null>;
  timeElapsedRef: React.RefObject<HTMLSpanElement | null>;
  timeRemainingRef: React.RefObject<HTMLSpanElement | null>;
};

export function usePlaybackProgress({
  positionMs,
  durationMs,
  isPlaying,
  trackUri,
}: UsePlaybackProgressArgs) {
  // ref for last playback position received from spotify sdk
  const spotifyPositionRef = useRef({ position: positionMs, at: Date.now() });
  const barRef = useRef<HTMLDivElement>(null);
  const timeElapsedRef = useRef<HTMLSpanElement>(null);
  const timeRemainingRef = useRef<HTMLSpanElement>(null);

  // anytime we receive new position, duration, user plays or pauses, or new track switches,
  // official ref updates
  useEffect(() => {
    spotifyPositionRef.current = { position: positionMs, at: Date.now() };
  }, [positionMs, durationMs, isPlaying, trackUri]);

  // if isPlaying, use requestAnimationFrame to update div element width
  useEffect(() => {
    if (!isPlaying) return;

    let pos: number;
    function tick() {
      const elapsed =
        spotifyPositionRef.current.position +
        (Date.now() - spotifyPositionRef.current.at);

      if (timeElapsedRef.current) {
        timeElapsedRef.current!.textContent = formatTime(
          Math.min(elapsed, durationMs),
        );
      }
      if (timeRemainingRef.current) {
        timeRemainingRef.current!.textContent = formatTime(
          Math.max(durationMs - elapsed, 0),
        );
      }

      const percentElapsed = Math.min((elapsed / durationMs) * 100, 100);
      barRef.current!.style.width = `${percentElapsed}%`;
      if (percentElapsed < 100) pos = requestAnimationFrame(tick);
    }

    pos = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(pos);
  }, [isPlaying, durationMs]);

  // if paused, set bar width directly from spotify position
  useEffect(() => {
    if (isPlaying || !barRef.current || durationMs <= 0) return;
    barRef.current.style.width = `${(positionMs / durationMs) * 100}%`;
  }, [isPlaying, positionMs, durationMs]);

  return {
    barRef,
    timeElapsedRef,
    timeRemainingRef,
  };
}
