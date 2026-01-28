import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import type {
  PlaybackPlayer,
  PlaybackState,
  SpotifyTrack,
} from "~/lib/spotify.types";
import { useAuth } from "./AuthContext";

interface PlaybackContextValue {
  isReady: boolean;
  isPlaying: boolean;
  currentTrack: SpotifyTrack | null;
  position: number;
  duration: number;
  deviceId: string | null;
  togglePlayPause: () => Promise<void>;
  next: () => Promise<void>;
  prev: () => Promise<void>;
  seek: (position: number) => Promise<void>;
}

const PlaybackContext = createContext<PlaybackContextValue | null>(null);

export function PlaybackProvider({ children }: { children: React.ReactNode }) {
  const { getSpotifyAccessToken, user } = useAuth();
  const [player, setPlayer] = useState<PlaybackPlayer | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [playbackState, setPlaybackState] = useState<PlaybackState | null>(
    null,
  );
  const [isReady, setIsReady] = useState(false);
  const loaded = useRef(false);

  // load spotify player sdk script
  useEffect(() => {
    if (!user || loaded.current) return;

    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;

    document.body.appendChild(script);
    loaded.current = true;

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: "iPod Player",
        getOAuthToken: async (cb) => {
          const token = await getSpotifyAccessToken();
          if (token) cb(token);
        },
        volume: 0.5,
      });

      // connected
      player.addListener("ready", ({ device_id }) => {
        console.log("Ready with Device ID", device_id);
        setDeviceId(device_id);
        setIsReady(true);
      });

      player.addListener("not_ready", ({ device_id }) => {
        console.log("Device ID has gone offline", device_id);
        setIsReady(false);
      });

      // player state changed
      player.addListener(
        "player_state_changed",
        (state: PlaybackState | null) => {
          if (state) {
            setPlaybackState(state);
          }
        },
      );

      player.connect();
      setPlayer(player);
    };
    return () => {
      if (player) {
        player.disconnect();
      }
    };
  }, [user, getSpotifyAccessToken]);

  const togglePlayPause = useCallback(async () => {
    if (player) {
      await player.togglePlay();
    }
  }, [player]);

  const next = useCallback(async () => {
    if (player) {
      await player.nextTrack();
    }
  }, [player]);

  const prev = useCallback(async () => {
    if (player) {
      await player.previousTrack();
    }
  }, [player]);

  const seek = useCallback(
    async (position: number) => {
      if (player) {
        await player.seek(position);
      }
    },
    [player],
  );

  const value: PlaybackContextValue = {
    isReady,
    isPlaying: playbackState ? !playbackState.paused : false,
    currentTrack: playbackState?.track_window.current_track ?? null,
    position: playbackState?.position ?? 0,
    duration: playbackState?.duration ?? 0,
    deviceId,
    togglePlayPause,
    next,
    prev,
    seek,
  };

  return (
    <PlaybackContext.Provider value={value}>
      {children}
    </PlaybackContext.Provider>
  );
}

export function usePlayback() {
  const context = useContext(PlaybackContext);
  if (!context) {
    throw new Error("Must use usePlayback within a Playback provider");
  }
  return context;
}
