import { useEffect, useState, useRef } from "react";

export interface UsePlaybackProgressArgs {
  positionMs: number;
  durationMs: number;
  isPlaying: boolean;
  trackUri: string | null;
}

export function usePlaybackProgress({
  positionMs,
  durationMs,
  isPlaying,
  trackUri,
}: UsePlaybackProgressArgs) {
  // ref for last playback position received from spotify sdk
  const spotifyPositionRef = useRef({ position: positionMs, at: Date.now() });
  const [, setFrame] = useState(0);

  // anytime we receive new position, duration, user plays or pauses, or new track switches,
  // official ref updates
  useEffect(() => {
    spotifyPositionRef.current = { position: positionMs, at: Date.now() };
  }, [positionMs, durationMs, isPlaying, trackUri]);

  // if isPlaying, use requestAnimationFrame to move bar
  useEffect(() => {
    if (!isPlaying) return;

    let pos = 0;
    function tick() {
      setFrame((n) => n + 1); // react only rerenders a ref when state changes
      pos = requestAnimationFrame(tick);
    }

    pos = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(pos);
  }, [isPlaying]);

  if (durationMs <= 0) return 0;

  // if player is playing, pos is elapsed time since last position ref snapshot
  // + we clamp so it doesn't exceed duration of song
  const liveMs = isPlaying
    ? Math.min(
        spotifyPositionRef.current.position +
          (Date.now() - spotifyPositionRef.current.at),
        durationMs,
      )
    : // if paused, it's just the position that spotify api returns
      positionMs;
  return (liveMs / durationMs) * 100;
}
