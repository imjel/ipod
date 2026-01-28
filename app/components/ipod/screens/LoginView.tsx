interface LoginViewProps {
  onSignIn: () => void;
  isLoading?: boolean;
}

export default function LoginView({ onSignIn, isLoading }: LoginViewProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-black">
      <img
        src="/assets/apple-logo.png"
        alt="White Apple logo"
        className="w-24 h-28  animate-fade-in"
      />
      <button
        className="font-helvetica text-slate-50 text-sm animate-fade-in hover:text-slate-300"
        onClick={onSignIn}
        disabled={isLoading}
      >
        {isLoading ? "..." : "Log in with Spotify"}
      </button>
    </div>
  );
}
