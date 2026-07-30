import { useEffect, useState } from "react";
import { useSpotify } from "~/hooks/useSpotify";
import { usePlayback } from "~/context/PlaybackContext";
import type { SpotifyPlaylist } from "~/lib/spotify.types";

export default function PlaylistView() {
  const { client, isReady } = useSpotify();
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);

  useEffect(() => {
    if (!isReady) return;
    const load = async () => {
      const response = await client.getPlaylists();
      setPlaylists(response.items);
    };
    load();
  }, [isReady, client]);

  return (
    <ul className="flex flex-col overflow-y-auto">
      {playlists &&
        playlists.map((p, index) => (
          <li
            className={`flex flex-row justify-between px-1 items-center font-regular font-helvetica`}
            key={p.uri}
          >
            {p.name}
          </li>
        ))}
    </ul>
  );
}
