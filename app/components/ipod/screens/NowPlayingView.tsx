import { usePlayback } from "~/context/PlaybackContext";
import { usePlaybackProgress } from "~/hooks/usePlaybackProgress";
import { ProgressBarWithTimestamps } from "./shared/ProgressBarWithTimestamps";

export default function NowPlayingView() {
  const { currentTrack, position, duration, isPlaying } = usePlayback();
  const albumArt = currentTrack?.album.images[0]?.url;
  const artistNames = currentTrack?.artists.map((a) => a.name).join(", ");
  const trackName = currentTrack?.name;
  const progress = usePlaybackProgress({
    positionMs: position,
    durationMs: duration,
    isPlaying,
    trackUri: currentTrack?.uri ?? null,
  });

  if (!currentTrack) {
    return <p>Nothing playing D:</p>;
  }

  return (
    <div className="view-layout flex flex-col items-start justify-between">
      <section className="flex flex-row gap-2">
        {albumArt && (
          <img
            src={albumArt}
            alt={currentTrack.album.name}
            className="w-20 h-20 shadow-sm items-left"
          />
        )}
        <ul className="min-w-0 flex-1 flex-col items-start text-start">
          <li className="text-sm truncate w-auto">{trackName}</li>
          <li className="text-sm truncate w-full">{artistNames}</li>
          <li className="text-sm truncate w-auto">{currentTrack.album.name}</li>
        </ul>
      </section>

      <ProgressBarWithTimestamps
        ref={progress.barRef}
        timeElapsedRef={progress.timeElapsedRef}
        timeRemainingRef={progress.timeRemainingRef}
      />
    </div>
  );
}
