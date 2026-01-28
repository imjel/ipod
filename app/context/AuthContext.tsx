import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { createBrowserClient } from "@supabase/ssr";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import type { AuthContextValue, AuthState } from "~/lib/auth.types";

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
  initialSession: Session | null;
  env: {
    SUPABASE_URL: string;
    SUPABASE_ANON_KEY: string;
  };
}

export function AuthProvider({
  children,
  initialSession,
  env,
}: AuthProviderProps) {
  // Create supabase client with env vars from server
  const supabase = useMemo<SupabaseClient>(
    () => createBrowserClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY),
    [env.SUPABASE_URL, env.SUPABASE_ANON_KEY],
  );

  const [state, setState] = useState<AuthState>({
    user: initialSession?.user ?? null,
    session: initialSession,
    isLoading: false,
    isClientReady: true, // Client is ready immediately now
    spotifyToken: initialSession?.provider_token ?? null,
  });

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setState((prev) => ({
        ...prev,
        user: session?.user ?? null,
        session,
        spotifyToken: session?.provider_token ?? null,
      }));
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const signInWithSpotify = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "spotify",
      options: {
        scopes:
          "user-read-email user-read-private playlist-read-private playlist-read-collaborative user-modify-playback-state user-read-playback-state user-read-currently-playing streaming",
        redirectTo: `${window.location.origin}/callback`,
      },
    });
    if (error) throw error;
  }, [supabase]);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, [supabase]);

  const getSpotifyAccessToken = useCallback(async (): Promise<
    string | null
  > => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.provider_token) {
      return session.provider_token;
    }

    const {
      data: { session: refreshedSession },
      error,
    } = await supabase.auth.refreshSession();

    if (error || !refreshedSession?.provider_token) {
      console.error("Failed to get Spotify token:", error);
      return null;
    }

    return refreshedSession.provider_token;
  }, [supabase]);

  const value: AuthContextValue = {
    ...state,
    supabase,
    signInWithSpotify,
    signOut,
    getSpotifyAccessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
