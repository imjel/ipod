import { useEffect } from "react";
import { useSpotify } from "~/hooks/useSpotify";

export default function PlaylistView() {
  const { client, isReady } = useSpotify();

  useEffect(() => {
    if (!isReady) return;
    client.getPlaylists();
  }, [isReady, client]);

  return null;
}
