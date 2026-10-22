import type { Session, User, SupabaseClient } from "@supabase/supabase-js";

export interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isClientReady: boolean;
}

export interface AuthContextValue extends AuthState {
  supabase: SupabaseClient;
  signInWithSpotify: () => Promise<void>;
  signOut: () => Promise<void>;
  getSpotifyAccessToken: (force?: boolean) => Promise<string | null>;
}

export const SPOTIFY_REFRESH_COOKIE = "spotify-refresh-token";
