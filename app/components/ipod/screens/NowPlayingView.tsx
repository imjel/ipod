import { usePlayback } from "~/context/PlaybackContext";
import { ProgressBar } from "./playlist/ProgressBar";
import { usePlaybackProgress } from "~/hooks/usePlaybackProgress";

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
    <div className="flex flex-col items-start p-3 h-full justify-between">
      <section className="flex flex-row gap-2">
        {albumArt && (
          <img
            src={albumArt}
            alt={currentTrack.album.name}
            className="w-15 h-15 shadow-sm"
          />
        )}
        <ul className="min-w-0 flex-1 flex-col items-start text-start">
          <li className="text-sm truncate w-full">{trackName}</li>
          <li className="text-sm truncate w-full">{artistNames}</li>
          <li className="text-sm truncate w-full">{currentTrack.album.name}</li>
        </ul>
      </section>

      <ProgressBar ref={progress} />
    </div>
  );
}
