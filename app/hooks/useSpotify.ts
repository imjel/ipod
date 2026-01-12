/**
 * hook wraps spotify client with auth context
 */
import { SpotifyClient } from "~/lib/spotify";
import { useAuth } from "~/context/AuthContext";
import { useMemo } from "react";

export function useSpotify() {
  const { getSpotifyAccessToken, user } = useAuth();

  const client = useMemo(
    () => new SpotifyClient(getSpotifyAccessToken),
    [getSpotifyAccessToken],
  );

  // check if user is logged in
  const isReady = !!user;

  return {
    client,
    isReady,
  };
}
