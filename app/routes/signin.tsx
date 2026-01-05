import { useSearchParams, useNavigate } from "react-router";
import { useAuth } from "~/context/AuthContext";
import { useEffect } from "react";

export default function SignIn() {

  const { signInWithSpotify, user, isLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const error = searchParams.get("error");

  useEffect(() => {
    if (user && !isLoading) {
      navigate("/");
    }
  }, [user, isLoading, navigate]);

  const handleSpotifySignIn = async () => {
    try {
      await signInWithSpotify();
    } catch (error) {
      console.error("Sign in error:", error);
    }
  };

  return (
    <>
    {
      error && (
        <div className="bg-red-100 text-red-800">
          Error: {error}
        </div>
      )
    }
      <button onClick={handleSpotifySignIn}>Sign in with Spotify</button>
    </>
  );
}
