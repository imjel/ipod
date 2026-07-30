import { useEffect, useState } from "react";
import { useSpotify } from "~/hooks/useSpotify";
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
    <ul className="view-layout flex flex-col overflow-y-auto gap-2">
      {playlists &&
        playlists.map((p, index) => (
          <li className={`flex flex-row items-top gap-2`} key={p.uri}>
            <img
              src={p.images[0].url}
              alt={p.name}
              className="w-12 h-12 shadow-sm"
            />
            <section className="min-w-0 flex flex-col gap-0.5 font-helvetica">
              <span className="font-medium truncate w-auto">{p.name}</span>
              <span className="font-regular text-gray-700 truncate w-auto">
                {p.tracks.total} songs
              </span>
            </section>
          </li>
        ))}
    </ul>
  );
}
