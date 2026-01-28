import { usePlayback } from "~/context/PlaybackContext";

export default function NowPlayingView() {
  const { currentTrack, position, duration } = usePlayback();
  const albumArt = currentTrack?.album.images[0]?.url;
  const artistNames = currentTrack?.artists.map((a) => a.name);
  const trackName = currentTrack?.name;
  const progress = duration > 0 ? (position / duration) * 100 : 0;

  if (!currentTrack) {
    return <p>Nothing playing D:</p>;
  }

  return (
    <div className="flex flex-col items-center p-2 h-full">
      {albumArt && (
        <img
          src={albumArt}
          alt={currentTrack.album.name}
          className="w-15 h-15 shadow-sm"
        />
      )}
      <p className="text-sm truncate w-full text-center">{trackName}</p>
      <p className="text-sm truncate w-full text-center">{artistNames}</p>
      <li className="text-sm truncate w-full text-center">
        {currentTrack.album.name}
      </li>
      <div className="w-full p-1 bg-slate-100 rounded">
        <div
          className="h-full bg-blue-300 rounded"
          style={{ width: `${progress}` }}
        ></div>
      </div>
    </div>
  );
}
