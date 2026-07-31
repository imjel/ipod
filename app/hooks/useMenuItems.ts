import type {
  iPodRoute,
  Screen,
  MenuItem,
} from "~/components/ipod/routes/routes";
import { useSpotify } from "./useSpotify";
import { useState, useEffect } from "react";

export function useMenuItems(
  route: iPodRoute,
  staticMenus: Partial<Record<Screen, MenuItem[]>>,
  playTrack: (uri: string) => Promise<void>,
): MenuItem[] {
  const { client, isReady } = useSpotify();
  const [dynamicItems, setDynamicItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    if (!isReady) return;

    // "dynamic" items are menu items that both navigate + call an api to populate the next route
    const load = async (): Promise<MenuItem[] | null> => {
      switch (route.screen) {
        case "Playlists": {
          const res = await client.getPlaylists();
          return res.items.map((playlist) => ({
            label: playlist.name,
            route: {
              screen: "PlaylistTracks",
              playlistId: playlist.id,
            },
          }));
        }
        case "PlaylistTracks": {
          const res = await client.getPlaylistTracks(route.playlistId);
          return res.items.map((t) => ({
            label: t.track.name,
            action: () => playTrack(t.track.uri),
            route: { screen: "NowPlaying" },
          }));
        }
        case "Artists": {
          const res = await client.getTopArtists();
          return res.items.map((artist) => ({
            label: artist.name,
            route: {
              screen: "Artist",
              artistId: artist.id,
            },
          }));
        }
        case "Artist": {
          const res = await client.getArtistTopTracks(route.artistId);
          return res.map((t) => ({
            label: t.name,
            action: () => playTrack(t.uri),
            route: { screen: "NowPlaying" },
          }));
        }
        default:
          return null;
      }
    };
    load().then((items) => {
      if (items) setDynamicItems(items);
    });
  }, [route, client, isReady, playTrack]);

  return staticMenus[route.screen] ?? dynamicItems;
}
