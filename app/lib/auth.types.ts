import type { Session, User, SupabaseClient } from "@supabase/supabase-js";

export interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isClientReady: boolean;
  spotifyToken: string | null;
}

export interface AuthContextValue extends AuthState {
  supabase: SupabaseClient;
  signInWithSpotify: () => Promise<void>;
  signOut: () => Promise<void>;
  getSpotifyAccessToken: () => Promise<string | null>;
}
