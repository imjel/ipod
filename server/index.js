import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable } from "@react-router/node";
import { ServerRouter, UNSAFE_withComponentProps, useLoaderData, Outlet, UNSAFE_withErrorBoundaryProps, isRouteErrorResponse, data, Meta, Links, ScrollRestoration, Scripts, redirect } from "react-router";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { createContext, useMemo, useState, useRef, useEffect, useCallback, useContext, useReducer } from "react";
import { createBrowserClient, createServerClient, serializeCookieHeader, parseCookieHeader } from "@supabase/ssr";
import { FaFastForward, FaFastBackward } from "react-icons/fa";
import { IoMdPlay, IoMdPause } from "react-icons/io";
import { MdChevronRight } from "react-icons/md";
import { redirectWithError } from "remix-toast";
const streamTimeout = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, routerContext, loadContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    let userAgent = request.headers.get("user-agent");
    let readyOption = userAgent && isbot(userAgent) || routerContext.isSpaMode ? "onAllReady" : "onShellReady";
    let timeoutId = setTimeout(
      () => abort(),
      streamTimeout + 1e3
    );
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(ServerRouter, { context: routerContext, url: request.url }),
      {
        [readyOption]() {
          shellRendered = true;
          const body = new PassThrough({
            final(callback) {
              clearTimeout(timeoutId);
              timeoutId = void 0;
              callback();
            }
          });
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          pipe(body);
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest,
  streamTimeout
}, Symbol.toStringTag, { value: "Module" }));
const AuthContext = createContext(null);
function AuthProvider({
  children,
  initialSession,
  env
}) {
  const supabase = useMemo(
    () => createBrowserClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY),
    [env.SUPABASE_URL, env.SUPABASE_ANON_KEY]
  );
  const [state, setState] = useState({
    user: initialSession?.user ?? null,
    session: initialSession,
    isLoading: false,
    isClientReady: true
    // Client is ready immediately now
  });
  const spotifyTokenRef = useRef(
    null
  );
  const promiseRef = useRef(null);
  useEffect(() => {
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setState((prev) => ({
        ...prev,
        user: session?.user ?? null,
        session
      }));
      if (event === "SIGNED_OUT") spotifyTokenRef.current = null;
    });
    return () => subscription.unsubscribe();
  }, [supabase]);
  const signInWithSpotify = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "spotify",
      options: {
        scopes: "user-read-email user-read-private playlist-read-private playlist-read-collaborative user-modify-playback-state user-read-playback-state user-read-currently-playing streaming user-top-read",
        redirectTo: `${window.location.origin}/callback`
      }
    });
    if (error) throw error;
  }, [supabase]);
  const signOut = useCallback(async () => {
    await fetch("/api/spotify/token", { method: "DELETE" });
    spotifyTokenRef.current = null;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, [supabase]);
  const getSpotifyAccessToken = useCallback(
    async (force) => {
      if (!force) {
        if (spotifyTokenRef.current !== null && spotifyTokenRef.current.expires_at > Date.now() + 6e4) {
          return spotifyTokenRef.current.access_token;
        }
      }
      if (promiseRef.current !== null) {
        return promiseRef.current;
      }
      const refresh = async () => {
        const response = await fetch("/api/spotify/token", {
          method: "POST"
        });
        if (!response.ok) {
          if (response.status === 401) {
            signOut().catch(console.error);
          }
          spotifyTokenRef.current = null;
          return null;
        }
        const { access_token, expires_at } = await response.json();
        spotifyTokenRef.current = { access_token, expires_at };
        return access_token;
      };
      promiseRef.current = refresh();
      try {
        return await promiseRef.current;
      } catch (error) {
        spotifyTokenRef.current = null;
        return null;
      } finally {
        promiseRef.current = null;
      }
    },
    [signOut]
  );
  const value = {
    ...state,
    supabase,
    signInWithSpotify,
    signOut,
    getSpotifyAccessToken
  };
  return /* @__PURE__ */ jsx(AuthContext.Provider, { value, children });
}
function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
const PlaybackContext = createContext(null);
function PlaybackProvider({ children }) {
  const { getSpotifyAccessToken, user, signOut } = useAuth();
  const [player, setPlayer] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [playbackState, setPlaybackState] = useState(
    null
  );
  const [isReady, setIsReady] = useState(false);
  const loaded = useRef(false);
  useEffect(() => {
    if (!user || loaded.current) return;
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);
    loaded.current = true;
    window.onSpotifyWebPlaybackSDKReady = () => {
      const player2 = new window.Spotify.Player({
        name: "iPod Player",
        getOAuthToken: async (cb) => {
          const token = await getSpotifyAccessToken();
          if (token) cb(token);
        },
        volume: 0.5
      });
      player2.addListener("ready", ({ device_id }) => {
        setDeviceId(device_id);
        setIsReady(true);
      });
      player2.addListener("not_ready", () => {
        setIsReady(false);
      });
      player2.addListener("authentication_error", () => {
        signOut().catch(console.error);
      });
      player2.addListener(
        "player_state_changed",
        (state) => {
          if (state) {
            setPlaybackState(state);
          }
        }
      );
      player2.connect();
      setPlayer(player2);
    };
  }, [user, getSpotifyAccessToken, signOut]);
  useEffect(() => {
    if (!user && player) {
      player.disconnect();
      setPlayer(null);
      setDeviceId(null);
      setIsReady(false);
      setPlaybackState(null);
    }
  }, [user, player]);
  const togglePlayPause = useCallback(async () => {
    if (player) {
      await player.togglePlay();
    }
  }, [player]);
  const next = useCallback(async () => {
    if (!player) return;
    try {
      await player.nextTrack();
    } catch (err) {
      console.error("Skip to next failed:", err);
    }
  }, [player]);
  const prev = useCallback(async () => {
    if (!player) return;
    try {
      await player.previousTrack();
    } catch (err) {
      console.error("Skip to previous failed:", err);
    }
  }, [player]);
  const seek = useCallback(
    async (position) => {
      if (player) {
        await player.seek(position);
      }
    },
    [player]
  );
  const value = {
    isReady,
    isPlaying: playbackState ? !playbackState.paused : false,
    currentTrack: playbackState?.track_window.current_track ?? null,
    position: playbackState?.position ?? 0,
    duration: playbackState?.duration ?? 0,
    deviceId,
    togglePlayPause,
    next,
    prev,
    seek
  };
  return /* @__PURE__ */ jsx(PlaybackContext.Provider, { value, children });
}
function usePlayback() {
  const context = useContext(PlaybackContext);
  if (!context) {
    throw new Error("Must use usePlayback within a Playback provider");
  }
  return context;
}
function createSupabaseServerClient(request) {
  const headers = new Headers();
  const supabase = createServerClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(request.headers.get("Cookie") ?? "").map(
            (c) => ({
              name: c.name,
              value: c.value ?? ""
            })
          );
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(
            ({ name, value, options }) => headers.append(
              "Set-Cookie",
              serializeCookieHeader(name, value, options)
            )
          );
        }
      }
    }
  );
  return { supabase, headers };
}
const links = () => [{
  rel: "preconnect",
  href: "https://fonts.googleapis.com"
}, {
  rel: "preconnect",
  href: "https://fonts.gstatic.com",
  crossOrigin: "anonymous"
}, {
  rel: "stylesheet",
  href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
}];
async function loader$1({
  request,
  context
}) {
  const {
    supabase,
    headers
  } = createSupabaseServerClient(request);
  const {
    data: {
      session
    }
  } = await supabase.auth.getSession();
  return data({
    session,
    env: {
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY
    }
  }, {
    headers
  });
}
function Layout({
  children
}) {
  return /* @__PURE__ */ jsxs("html", {
    lang: "en",
    suppressHydrationWarning: true,
    children: [/* @__PURE__ */ jsxs("head", {
      children: [/* @__PURE__ */ jsx("meta", {
        charSet: "utf-8"
      }), /* @__PURE__ */ jsx("meta", {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
      }), /* @__PURE__ */ jsx("script", {
        dangerouslySetInnerHTML: {
          __html: `try{document.documentElement.dataset.ipodColor=localStorage.getItem("ipod-color")||""}catch(e){}`
        }
      }), /* @__PURE__ */ jsx(Meta, {}), /* @__PURE__ */ jsx(Links, {})]
    }), /* @__PURE__ */ jsxs("body", {
      children: [children, /* @__PURE__ */ jsx(ScrollRestoration, {}), /* @__PURE__ */ jsx(Scripts, {})]
    })]
  });
}
const root = UNSAFE_withComponentProps(function App() {
  const {
    session,
    env
  } = useLoaderData();
  return /* @__PURE__ */ jsx(AuthProvider, {
    initialSession: session,
    env,
    children: /* @__PURE__ */ jsx(PlaybackProvider, {
      children: /* @__PURE__ */ jsx(Outlet, {})
    })
  });
});
const ErrorBoundary = UNSAFE_withErrorBoundaryProps(function ErrorBoundary2({
  error
}) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack;
  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details = error.status === 404 ? "The requested page could not be found." : error.statusText || details;
  }
  return /* @__PURE__ */ jsxs("main", {
    className: "pt-16 p-4 container mx-auto",
    children: [/* @__PURE__ */ jsx("h1", {
      children: message
    }), /* @__PURE__ */ jsx("p", {
      children: details
    }), stack]
  });
});
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ErrorBoundary,
  Layout,
  default: root,
  links,
  loader: loader$1
}, Symbol.toStringTag, { value: "Module" }));
function useWheel({ onScroll }) {
  const [scrolling, setScrolling] = useState(false);
  const wheelRef = useRef(null);
  const lastAngleRef = useRef(0);
  const timer = useRef(null);
  const getAngle = (clientX, clientY) => {
    if (!wheelRef.current) return 0;
    const rect = wheelRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    return Math.atan2(deltaY, deltaX) * (180 / Math.PI);
  };
  const handleWheelStart = (clientX, clientY) => {
    setScrolling(true);
    lastAngleRef.current = getAngle(clientX, clientY);
  };
  const handleWheelMove = (clientX, clientY) => {
    if (!scrolling || !onScroll) return;
    const currentAngle = getAngle(clientX, clientY);
    let delta = currentAngle - lastAngleRef.current;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    if (Math.abs(delta) > 10) {
      onScroll(delta > 0 ? 1 : -1);
      lastAngleRef.current = currentAngle;
    }
  };
  const handleWheelEnd = () => {
    setScrolling(false);
  };
  useEffect(() => {
    const wheelElement = wheelRef.current;
    if (!wheelElement) return;
    const handleWheel = (e) => {
      e.preventDefault();
      if (!onScroll) return;
      if (timer.current) return;
      timer.current = true;
      setTimeout(() => {
        timer.current = false;
      }, 100);
      onScroll(e.deltaY > 0 ? 1 : -1);
    };
    wheelElement.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      wheelElement.removeEventListener("wheel", handleWheel);
    };
  }, [onScroll]);
  const handleMouseDown = (e) => {
    e.preventDefault();
    handleWheelStart(e.clientX, e.clientY);
  };
  const handleMouseMove = (e) => {
    handleWheelMove(e.clientX, e.clientY);
  };
  const handleMouseUp = () => {
    handleWheelEnd();
  };
  return {
    handleMouseDown,
    handleMouseUp,
    handleMouseMove,
    handleWheelEnd,
    handleWheelMove,
    handleWheelStart,
    wheelRef
  };
}
function Wheel({
  onScroll,
  onSelect,
  onMenu,
  onPlayPause,
  onNext,
  onPrevious
}) {
  const { wheelRef, handleMouseDown, handleMouseMove, handleMouseUp } = useWheel({ onScroll });
  return /* @__PURE__ */ jsxs(
    "div",
    {
      ref: wheelRef,
      className: "wheel relative flex items-center justify-center rounded-full bg-white border-2 border-ipod-border w-62 h-62 shadow-sm select-none",
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseLeave: handleMouseUp,
      onMouseUp: handleMouseUp,
      children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "absolute top-2.5 left-1/2 -translate-x-1/2 text-wheel-text text-lg font-semibold",
            onClick: onMenu,
            children: "MENU"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "absolute right-3 bottom-1/2 translate-y-1/2 text-wheel-text",
            onClick: onNext,
            children: /* @__PURE__ */ jsx(FaFastForward, { size: 20, className: "text-wheel-text " })
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "absolute left-3 bottom-1/2 translate-y-1/2",
            onClick: onPrevious,
            children: /* @__PURE__ */ jsx(FaFastBackward, { size: 20, className: "text-wheel-text" })
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "absolute bottom-2.5 left-1/2 -translate-x-1/2 text-md",
            onClick: onPlayPause,
            children: /* @__PURE__ */ jsxs("span", { className: "flex flex-row", children: [
              /* @__PURE__ */ jsx(IoMdPlay, { size: 18, className: "text-wheel-text" }),
              /* @__PURE__ */ jsx(IoMdPause, { size: 18, className: "text-wheel-text" })
            ] })
          }
        ),
        /* @__PURE__ */ jsx("button", { className: "ipod-select-button", onClick: onSelect })
      ]
    }
  );
}
function Battery() {
  return /* @__PURE__ */ jsx("div", { className: "battery-border-gradient battery-border-gradient-slate w-6 h-3 battery-gradient from-lime-300 to-lime-700 rounded-xs" });
}
function ScreenHeader() {
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-row border-b border-[#237FAE] bg-screen shadow-inner w-full h-6 items-center justify-between font-semibold", children: [
    /* @__PURE__ */ jsx("h1", { className: "flex-1 text-center ml-8", children: "iPod" }),
    /* @__PURE__ */ jsx("div", { className: "mr-1", children: /* @__PURE__ */ jsx(Battery, {}) })
  ] });
}
function MenuView({
  selectedIndex,
  onHover,
  menuItems
}) {
  return /* @__PURE__ */ jsx("div", { className: "overflow-y-auto", children: /* @__PURE__ */ jsx("ul", { className: "ipod-menu", children: menuItems.map((item, index) => /* @__PURE__ */ jsxs(
    "li",
    {
      className: "ipod-menu-item",
      onMouseEnter: () => onHover?.(index),
      "data-selected": index === selectedIndex,
      children: [
        /* @__PURE__ */ jsx("span", { className: "w-full truncate", children: item.label }),
        item.route && /* @__PURE__ */ jsx(MdChevronRight, { size: 18 })
      ]
    },
    item.label
  )) }) });
}
function LoginView({ onSignIn, isLoading }) {
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center h-full bg-black", children: [
    /* @__PURE__ */ jsx(
      "img",
      {
        src: "/assets/apple-logo.png",
        alt: "White Apple logo",
        className: "w-24 h-28  animate-fade-in"
      }
    ),
    /* @__PURE__ */ jsx(
      "button",
      {
        className: "font-helvetica text-slate-50 text-sm animate-fade-in hover:text-slate-300",
        onClick: onSignIn,
        disabled: isLoading,
        children: isLoading ? "..." : "Log in with Spotify"
      }
    )
  ] });
}
function formatTime(s) {
  const seconds = s % 60;
  const minutes = Math.floor(s / 60);
  return String(minutes) + ":" + String(seconds).padStart(2, "0");
}
function usePlaybackProgress({
  positionMs,
  durationMs,
  isPlaying,
  trackUri
}) {
  const spotifyPositionRef = useRef({ position: positionMs, at: Date.now() });
  const barRef = useRef(null);
  const timeElapsedRef = useRef(null);
  const timeRemainingRef = useRef(null);
  useEffect(() => {
    spotifyPositionRef.current = { position: positionMs, at: Date.now() };
  }, [positionMs, durationMs, isPlaying, trackUri]);
  useEffect(() => {
    if (!isPlaying) return;
    let pos;
    function tick() {
      const elapsed = spotifyPositionRef.current.position + (Date.now() - spotifyPositionRef.current.at);
      const elapsedSec = Math.floor(Math.min(elapsed, durationMs) / 1e3);
      const durationSec = Math.round(durationMs / 1e3);
      const remainingSec = Math.max(durationSec - elapsedSec, 0);
      timeElapsedRef.current.textContent = formatTime(elapsedSec);
      timeRemainingRef.current.textContent = formatTime(remainingSec);
      const percentElapsed = Math.min(elapsed / durationMs * 100, 100);
      barRef.current.style.width = `${percentElapsed}%`;
      if (percentElapsed < 100) pos = requestAnimationFrame(tick);
    }
    pos = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(pos);
  }, [isPlaying, durationMs]);
  useEffect(() => {
    if (isPlaying || !barRef.current || durationMs <= 0) return;
    barRef.current.style.width = `${positionMs / durationMs * 100}%`;
  }, [isPlaying, positionMs, durationMs]);
  return {
    barRef,
    timeElapsedRef,
    timeRemainingRef
  };
}
function ProgressBar({
  ref
}) {
  return /* @__PURE__ */ jsx("section", { className: "flex w-full rounded-xs progress-bar-border progress-bar-outer-gradient", children: /* @__PURE__ */ jsx("div", { ref, className: "h-3 progress-bar-inner-gradient rounded-xs" }) });
}
function ProgressBarWithTimestamps({
  ref,
  timeElapsedRef,
  timeRemainingRef
}) {
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-0.5 w-full", children: [
    /* @__PURE__ */ jsx(ProgressBar, { ref }),
    /* @__PURE__ */ jsxs("section", { className: "flex flex-row justify-between", children: [
      /* @__PURE__ */ jsx("span", { ref: timeElapsedRef, children: "0:00" }),
      /* @__PURE__ */ jsx("span", { ref: timeRemainingRef, children: "0:00" })
    ] })
  ] });
}
function NowPlayingView() {
  const { currentTrack, position, duration, isPlaying } = usePlayback();
  const albumArt = currentTrack?.album.images[0]?.url;
  const artistNames = currentTrack?.artists.map((a) => a.name).join(", ");
  const trackName = currentTrack?.name;
  const progress = usePlaybackProgress({
    positionMs: position,
    durationMs: duration,
    isPlaying,
    trackUri: currentTrack?.uri ?? null
  });
  if (!currentTrack) {
    return /* @__PURE__ */ jsx("p", { children: "Nothing playing D:" });
  }
  return /* @__PURE__ */ jsxs("div", { className: "view-layout flex flex-col items-start justify-between", children: [
    /* @__PURE__ */ jsxs("section", { className: "flex w-full min-w-0 flex-row gap-2", children: [
      albumArt && /* @__PURE__ */ jsx(
        "img",
        {
          src: albumArt,
          alt: currentTrack.album.name,
          className: "w-20 h-20 shrink-0 shadow-sm"
        }
      ),
      /* @__PURE__ */ jsxs("ul", { className: "min-w-0 flex-1 text-start", children: [
        /* @__PURE__ */ jsx("li", { className: "text-md truncate", children: trackName }),
        /* @__PURE__ */ jsx("li", { className: "text-md truncate", children: artistNames }),
        /* @__PURE__ */ jsx("li", { className: "text-md truncate", children: currentTrack.album.name })
      ] })
    ] }),
    /* @__PURE__ */ jsx(
      ProgressBarWithTimestamps,
      {
        ref: progress.barRef,
        timeElapsedRef: progress.timeElapsedRef,
        timeRemainingRef: progress.timeRemainingRef
      }
    )
  ] });
}
function AboutView() {
  return /* @__PURE__ */ jsx("div", { className: "view-layout flex flex-col items-start", children: /* @__PURE__ */ jsxs("p", { className: "flex flex-col gap-4", children: [
    /* @__PURE__ */ jsxs("span", { className: "self-center", children: [
      "(˶",
      "  ",
      "ᵔ",
      "  ",
      " ̫",
      "  ",
      "ᵔ",
      "  ",
      "˶) ♡",
      " "
    ] }),
    /* @__PURE__ */ jsx("span", { children: "hi! I'm max. this is a fun project I made to learn more CSS & revisit the memories of my childhood iPod Nano" })
  ] }) });
}
const Suits = [
  { name: "Hearts", symbol: "♥" },
  { name: "Diamonds", symbol: "♦" },
  { name: "Clubs", symbol: "♣" },
  { name: "Spades", symbol: "♠" }
];
const CARD_VALUES = [
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13
];
const PIP_LAYOUTS = {
  1: [{ col: 2, row: 5 }],
  2: [
    { col: 2, row: 1 },
    { col: 2, row: 9 }
  ],
  3: [
    { col: 2, row: 1 },
    { col: 2, row: 5 },
    { col: 2, row: 9 }
  ],
  4: [
    { col: 1, row: 1 },
    { col: 3, row: 1 },
    { col: 1, row: 9 },
    { col: 3, row: 9 }
  ],
  5: [
    { col: 1, row: 1 },
    { col: 3, row: 1 },
    { col: 2, row: 5 },
    { col: 1, row: 9 },
    { col: 3, row: 9 }
  ],
  6: [
    { col: 1, row: 1 },
    { col: 3, row: 1 },
    { col: 1, row: 5 },
    { col: 3, row: 5 },
    { col: 1, row: 9 },
    { col: 3, row: 9 }
  ],
  7: [
    { col: 1, row: 1 },
    { col: 3, row: 1 },
    { col: 2, row: 7 },
    { col: 1, row: 5 },
    { col: 3, row: 5 },
    { col: 1, row: 9 },
    { col: 3, row: 9 }
  ],
  8: [
    { col: 1, row: 1 },
    { col: 3, row: 1 },
    { col: 2, row: 3 },
    { col: 1, row: 5 },
    { col: 3, row: 5 },
    { col: 2, row: 7 },
    { col: 1, row: 9 },
    { col: 3, row: 9 }
  ],
  9: [
    { col: 1, row: 1 },
    { col: 3, row: 1 },
    { col: 1, row: 3 },
    { col: 3, row: 3 },
    { col: 2, row: 5 },
    { col: 1, row: 7 },
    { col: 3, row: 7 },
    { col: 1, row: 9 },
    { col: 3, row: 9 }
  ],
  10: [
    { col: 1, row: 1 },
    { col: 3, row: 1 },
    { col: 2, row: 2 },
    { col: 1, row: 3 },
    { col: 3, row: 3 },
    { col: 1, row: 7 },
    { col: 3, row: 7 },
    { col: 2, row: 8 },
    { col: 1, row: 9 },
    { col: 3, row: 9 }
  ]
};
const FaceCardSymbol = {
  11: "♗",
  12: "♕",
  13: "♔"
};
const STUCK_MESSAGE = "You can't make any more moves D:";
const WIN_MESSAGE = "We have a winner!";
function shuffleDeck(cards) {
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}
function createNewDeck() {
  let deck = [];
  Suits.forEach((suit) => {
    CARD_VALUES.forEach((value) => {
      deck.push({ suit, value });
    });
  });
  return deck;
}
function compareCards(card1, card2) {
  return Math.abs(card1.value - card2.value);
}
function canPlay(card, topOfWaste) {
  return compareCards(card, topOfWaste) === 1;
}
function isColumnPlayable(column, topCard) {
  const card = column.at(-1);
  return card !== void 0 && canPlay(card, topCard);
}
function isWin(state) {
  return state.tableau.every((column) => column.length === 0);
}
function isStuck(state) {
  if (state.stock.length > 0) return false;
  const top = state.waste.at(-1);
  if (!top) return false;
  return !state.tableau.some((col) => isColumnPlayable(col, top));
}
function initTableau(deck) {
  let tableau = [];
  for (let i = 0; i < 7; i++) {
    const col = deck.slice(i * 5, i * 5 + 5);
    tableau.push(col);
  }
  return tableau;
}
function initGameState(deck) {
  const tableau = initTableau(deck);
  return {
    tableau,
    stock: deck.slice(36),
    // stock pile is remaining 16 cards
    waste: [deck[35]],
    history: []
  };
}
function reducer(state, action2) {
  switch (action2.type) {
    case "playCard": {
      const column = state.tableau[action2.column];
      const card = column.at(-1);
      const top = state.waste.at(-1);
      if (!top) return state;
      if (!card || !canPlay(card, top)) return state;
      return {
        ...state,
        tableau: state.tableau.map(
          (column2, i) => i === action2.column ? column2.slice(0, -1) : column2
        ),
        waste: [...state.waste, card],
        history: [...state.history, state]
      };
    }
    // move top card from stock to waste pile
    case "draw": {
      const drawnCard = state.stock.at(-1);
      if (!drawnCard) return state;
      return {
        ...state,
        stock: state.stock.slice(0, -1),
        waste: [...state.waste, drawnCard],
        history: [...state.history, state]
      };
    }
    case "undo": {
      return state.history.at(-1) ?? state;
    }
    case "newGame": {
      return initGameState(action2.deck);
    }
  }
}
function useSolitaire() {
  const [state, dispatch] = useReducer(
    reducer,
    void 0,
    () => initGameState(shuffleDeck(createNewDeck()))
  );
  return {
    state,
    playCard: (i) => dispatch({ type: "playCard", column: i }),
    draw: () => dispatch({ type: "draw" }),
    undo: () => dispatch({ type: "undo" }),
    isWin: isWin(state),
    isStuck: isStuck(state),
    newGame: () => dispatch({ type: "newGame", deck: shuffleDeck(createNewDeck()) })
  };
}
function cardValueToStr(val) {
  switch (val) {
    case 1:
      return "A";
    case 11:
      return "J";
    case 12:
      return "Q";
    case 13:
      return "K";
    default:
      return val.toString();
  }
}
function getSuitColor(suit) {
  return suit.name === "Diamonds" || suit.name === "Hearts" ? "red-suits" : "black-suits";
}
function isFaceCard(value) {
  return value >= 11;
}
function PlayingCard({ value, suit }) {
  const color = getSuitColor(suit);
  const pipCount = isFaceCard(value) ? 1 : PIP_LAYOUTS[value].length;
  return /* @__PURE__ */ jsxs("div", { className: `solitaire-card ${color}`, children: [
    /* @__PURE__ */ jsxs("span", { className: "card-label", children: [
      cardValueToStr(value),
      suit.symbol
    ] }),
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "card-pips",
        style: { "--pips": pipCount },
        children: isFaceCard(value) ? /* @__PURE__ */ jsx("span", { className: "face-card", children: FaceCardSymbol[value] }) : PIP_LAYOUTS[value].map(({ col, row }, i) => /* @__PURE__ */ jsx(
          "span",
          {
            style: {
              gridColumn: col,
              gridRow: row,
              transform: row > 5 ? "rotate(180deg)" : void 0
            },
            children: suit.symbol
          },
          i
        ))
      }
    )
  ] });
}
function CardColumn({ cards, playCard }) {
  return /* @__PURE__ */ jsx("button", { className: "column", onClick: playCard, children: cards.map((card) => /* @__PURE__ */ jsx(
    PlayingCard,
    {
      value: card.value,
      suit: card.suit
    },
    `${card.suit.name}-${card.value}`
  )) });
}
function Stock({ stock, draw }) {
  return /* @__PURE__ */ jsx("button", { onClick: draw, className: "solitaire-card-back", children: /* @__PURE__ */ jsx("span", { children: stock.length }) });
}
function Waste({ waste }) {
  const topCard = waste.at(-1) ?? void 0;
  return /* @__PURE__ */ jsx("div", { children: topCard ? /* @__PURE__ */ jsx(PlayingCard, { value: topCard.value, suit: topCard.suit }) : /* @__PURE__ */ jsx("p", { children: "yippee" }) });
}
function SolitaireMenu({ newGame, undo }) {
  return /* @__PURE__ */ jsxs("div", { className: "solitaire-menu", children: [
    /* @__PURE__ */ jsx("button", { className: "solitaire-menu-button", onClick: newGame, children: "new game" }),
    /* @__PURE__ */ jsx("button", { className: "solitaire-menu-button", onClick: undo, children: "undo" })
  ] });
}
function GameAlert({ message, onUndo, onRestart }) {
  return /* @__PURE__ */ jsxs("div", { className: "game-alert", children: [
    /* @__PURE__ */ jsx("p", { className: "game-alert-message", children: message }),
    /* @__PURE__ */ jsxs("section", { className: "flex flex-col justify-between", children: [
      onUndo && /* @__PURE__ */ jsx("button", { className: "game-alert-action", onClick: onUndo, children: "Undo" }),
      onRestart && /* @__PURE__ */ jsx("button", { className: "game-alert-action", onClick: onRestart, children: "Restart" })
    ] })
  ] });
}
function SolitaireBoard({
  game,
  draw,
  playCard,
  newGame,
  undo,
  isWin: isWin2,
  isStuck: isStuck2
}) {
  const tableau = game.tableau;
  const stock = game.stock;
  const waste = game.waste;
  return /* @__PURE__ */ jsxs("div", { className: "solitaire-board", children: [
    isStuck2 && /* @__PURE__ */ jsx("div", { className: "overlay", children: /* @__PURE__ */ jsx(
      GameAlert,
      {
        message: STUCK_MESSAGE,
        onRestart: newGame,
        onUndo: undo
      }
    ) }),
    isWin2 && /* @__PURE__ */ jsx("div", { className: "overlay", children: /* @__PURE__ */ jsx(GameAlert, { message: WIN_MESSAGE, onRestart: newGame }) }),
    /* @__PURE__ */ jsx("section", { className: "tableau", children: tableau.map((column, i) => /* @__PURE__ */ jsx(CardColumn, { cards: column, playCard: () => playCard(i) }, i)) }),
    /* @__PURE__ */ jsxs("section", { className: "stock-waste-section", children: [
      /* @__PURE__ */ jsx(Stock, { stock, draw }),
      /* @__PURE__ */ jsx(Waste, { waste })
    ] }),
    /* @__PURE__ */ jsx(SolitaireMenu, { newGame, undo })
  ] });
}
function SolitaireView() {
  const { state, playCard, draw, undo, isWin: isWin2, isStuck: isStuck2, newGame } = useSolitaire();
  return /* @__PURE__ */ jsx(
    SolitaireBoard,
    {
      game: state,
      draw,
      playCard,
      newGame,
      undo,
      isWin: isWin2,
      isStuck: isStuck2
    }
  );
}
function Screen({
  selectedIndex,
  currentScreen,
  onHover,
  menuItems
}) {
  const { user, isLoading, signInWithSpotify } = useAuth();
  const screenRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const timer = useRef(null);
  const handleMouseMove = (e) => {
    if (!screenRef.current) return;
    if (timer.current) return;
    timer.current = true;
    setTimeout(() => {
      timer.current = false;
    }, 200);
    const rect = screenRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePosition({ x, y });
  };
  const renderScreen = () => {
    if (currentScreen === "NowPlaying") {
      return /* @__PURE__ */ jsx(NowPlayingView, {});
    } else if (currentScreen === "About") {
      return /* @__PURE__ */ jsx(AboutView, {});
    } else if (currentScreen === "Solitaire") {
      return /* @__PURE__ */ jsx("div", { className: "cards-screen-background", children: /* @__PURE__ */ jsx(SolitaireView, {}) });
    } else {
      return /* @__PURE__ */ jsx(
        MenuView,
        {
          selectedIndex,
          currentScreen,
          onHover,
          menuItems
        }
      );
    }
  };
  return /* @__PURE__ */ jsxs(
    "div",
    {
      ref: screenRef,
      onMouseMove: handleMouseMove,
      className: "screen-class flex flex-col bg-screen border-2 border-screen-border w-64 h-48 shadow-[inset_0_-1px_2px_rgba(0,0,0,0.4)]",
      children: [
        !user ? /* @__PURE__ */ jsx(LoginView, { onSignIn: signInWithSpotify, isLoading }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(ScreenHeader, {}),
          renderScreen()
        ] }),
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "screen-overlay",
            style: {
              transform: `translate3d(${mousePosition.x * 0.8}px, ${mousePosition.y * 0.8}px, 0px)`
            }
          }
        )
      ]
    }
  );
}
const IPOD_COLORS = [
  {
    label: "Pink"
  },
  {
    label: "Blue"
  },
  { label: "Gray" },
  {
    label: "Green"
  },
  {
    label: "Black"
  }
];
function setColor(color) {
  document.documentElement.dataset.ipodColor = color.label.toLowerCase();
  localStorage.setItem("ipod-color", color.label.toLowerCase());
}
function getStaticMenuItems(signOut, shuffle) {
  return {
    home: [
      { label: "Music", route: { screen: "Music" } },
      { label: "Games", route: { screen: "Games" } },
      { label: "Settings", route: { screen: "Settings" } },
      { label: "Shuffle Songs", action: () => shuffle() }
    ],
    Music: [
      { label: "Playlists", route: { screen: "Playlists" } },
      { label: "Artists", route: { screen: "Artists" } },
      // { label: "Albums", route: "Albums" },
      // { label: "Songs", route: "Songs" },
      { label: "Now Playing", route: { screen: "NowPlaying" } }
    ],
    Games: [{ label: "Solitaire", route: { screen: "Solitaire" } }],
    Settings: [
      { label: "About", route: { screen: "About" } },
      {
        label: "Logout",
        action: () => {
          signOut();
        }
      },
      { label: "Change Color", route: { screen: "Colors" } }
    ],
    Colors: IPOD_COLORS.map((color) => ({
      label: color.label,
      action: () => setColor(color)
    }))
  };
}
class SpotifyClient {
  getAccessToken;
  constructor(getAccessToken) {
    this.getAccessToken = getAccessToken;
  }
  request(endpoint, token, options) {
    return fetch(`https://api.spotify.com/v1${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...options?.headers
      }
    });
  }
  async fetch(endpoint, options) {
    const token = await this.getAccessToken();
    if (!token) {
      throw new Error("No access token");
    }
    let response = await this.request(endpoint, token, options);
    if (response.status === 401) {
      const refreshedToken = await this.getAccessToken(true);
      if (!refreshedToken) throw new Error("No access token");
      response = await this.request(endpoint, refreshedToken, options);
    }
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(
        `Spotify API error: ${response.status} on ${endpoint}${detail ? ` - ${detail}` : ""}`
      );
    }
    if (response.status === 204) {
      return void 0;
    }
    const text = await response.text();
    if (!text) return void 0;
    try {
      return JSON.parse(text);
    } catch {
      return void 0;
    }
  }
  // get user information
  async getUser() {
    return this.fetch("/me");
  }
  // playlists
  async getPlaylists() {
    return this.fetch("/me/playlists");
  }
  async getPlaylistTracks(id) {
    return this.fetch(`/playlists/${id}/tracks`);
  }
  async getTopArtists() {
    return this.fetch(
      "/me/top/artists?offset=0&limit=10&time_range=medium_term"
    );
  }
  async getTopTracks(limit = 50) {
    return this.fetch(
      `/me/top/tracks?offset=0&limit=${limit}&time_range=medium_term`
    );
  }
  // not in use
  async getArtistDetails(artistId) {
    return this.fetch(`/artists/${artistId}`);
  }
  async getArtistTopTracks(artistId) {
    const res = await this.fetch(
      `/artists/${artistId}/top-tracks?market=US`
    );
    return res.tracks;
  }
  async transferPlayback(deviceId, play = false) {
    return this.fetch("/me/player", {
      method: "PUT",
      body: JSON.stringify({ device_ids: [deviceId], play })
    });
  }
  async shuffle(state = true, deviceId) {
    return this.fetch(
      `/me/player/shuffle?state=${state}&device_id=${deviceId}`,
      { method: "PUT" }
    );
  }
  async play(deviceId) {
    return this.fetch(`/me/player/play?device_id=${deviceId}`, {
      method: "PUT"
    });
  }
  async playTrack(deviceId, options) {
    return this.fetch(`/me/player/play?device_id=${deviceId}`, {
      method: "PUT",
      body: options ? JSON.stringify({
        ...options.uris && { uris: options.uris },
        ...options.contextUri && { context_uri: options.contextUri },
        ...options.offsetUri && { offset: { uri: options.offsetUri } }
      }) : void 0
    });
  }
}
function useSpotify() {
  const { getSpotifyAccessToken, user } = useAuth();
  const client = useMemo(
    () => new SpotifyClient(getSpotifyAccessToken),
    [getSpotifyAccessToken]
  );
  const isReady = !!user;
  return {
    client,
    isReady
  };
}
function useMenuItems(route, staticMenus, playTrack) {
  const { client, isReady } = useSpotify();
  const [dynamicItems, setDynamicItems] = useState([]);
  useEffect(() => {
    if (!isReady) return;
    const load = async () => {
      switch (route.screen) {
        case "Playlists": {
          const res = await client.getPlaylists();
          return res.items.map((playlist) => ({
            label: playlist.name,
            route: {
              screen: "PlaylistTracks",
              playlistId: playlist.id
            }
          }));
        }
        case "PlaylistTracks": {
          const res = await client.getPlaylistTracks(route.playlistId);
          const contextUri = `spotify:playlist:${route.playlistId}`;
          return res.items.map((t) => ({
            label: t.track.name,
            action: () => playTrack({ contextUri, offsetUri: t.track.uri }),
            route: { screen: "NowPlaying" }
          }));
        }
        case "Artists": {
          const res = await client.getTopArtists();
          return res.items.map((artist) => ({
            label: artist.name,
            route: {
              screen: "Artist",
              artistId: artist.id
            }
          }));
        }
        case "Artist": {
          const res = await client.getArtistTopTracks(route.artistId);
          const uris = res.map((t) => t.uri);
          return res.map((t) => ({
            label: t.name,
            action: () => playTrack({ uris, offsetUri: t.uri }),
            route: { screen: "NowPlaying" }
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
const EDGE_MARGIN = 20;
const SENSITIVITY = 0.4;
function useDragToRotate() {
  const dragging = useRef(false);
  const itemRef = useRef(null);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const rotation = useRef({ x: 0, y: 0 });
  const frame = useRef(0);
  const applyTransform = () => {
    const el = itemRef.current;
    if (!el) return;
    el.style.transform = `translateZ(-50px) rotateX(${rotation.current.x}deg) rotateY(${rotation.current.y}deg)`;
  };
  const cursorInDragArea = (x, y, rect) => x >= rect.left - EDGE_MARGIN && x <= rect.right + EDGE_MARGIN && y >= rect.top - EDGE_MARGIN && y <= rect.bottom + EDGE_MARGIN;
  const cursorInInterior = (x, y, rect) => x > rect.left + EDGE_MARGIN && x < rect.right - EDGE_MARGIN && y > rect.top + EDGE_MARGIN && y < rect.bottom - EDGE_MARGIN;
  const resetPosition = () => {
    const el = itemRef.current;
    if (!el) return;
    rotation.current = { x: 0, y: 0 };
    el.style.transform = "";
    el.style.transition = "";
  };
  useEffect(() => {
    const onMouseDown = (e) => {
      const el = itemRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (e.target.closest("button")) return;
      if (!cursorInDragArea(e.clientX, e.clientY, rect)) return;
      dragging.current = true;
      e.preventDefault();
      lastPosRef.current = { x: e.clientX, y: e.clientY };
      document.body.style.cursor = "grabbing";
      itemRef.current.style.transition = "none";
    };
    const onMouseMove = (e) => {
      const el = itemRef.current;
      if (!el) return;
      if (!dragging.current) {
        const rect = el.getBoundingClientRect();
        const isOnEdge = cursorInDragArea(e.clientX, e.clientY, rect) && !cursorInInterior(e.clientX, e.clientY, rect);
        document.body.style.cursor = isOnEdge ? "pointer" : "";
        return;
      }
      const deltaX = e.clientX - lastPosRef.current.x;
      const deltaY = e.clientY - lastPosRef.current.y;
      lastPosRef.current = { x: e.clientX, y: e.clientY };
      rotation.current.y += deltaX * SENSITIVITY;
      rotation.current.x += deltaY * SENSITIVITY;
      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(applyTransform);
    };
    const onMouseUp = () => {
      if (!dragging.current) return;
      dragging.current = false;
      document.body.style.cursor = "";
      if (itemRef.current) {
        itemRef.current.style.transition = "";
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      cancelAnimationFrame(frame.current);
    };
  }, []);
  return {
    itemRef,
    resetPosition
  };
}
function Body() {
  const [menuStack, setMenuStack] = useState([{ screen: "home" }]);
  const currentScreen = menuStack[menuStack.length - 1];
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const { client, isReady } = useSpotify();
  const { signOut } = useAuth();
  const { currentTrack, togglePlayPause, next, prev, deviceId } = usePlayback();
  const prevTrackRef = useRef(null);
  const { itemRef, resetPosition } = useDragToRotate();
  const shuffle = useCallback(async () => {
    if (!isReady || !deviceId) return;
    try {
      await client.transferPlayback(deviceId);
      const shuffledTracks = await client.getTopTracks();
      const uris = shuffledTracks.items.map((track) => track.uri);
      if (!uris.length) return;
      for (let i = uris.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [uris[i], uris[j]] = [uris[j], uris[i]];
      }
      await client.shuffle(true, deviceId);
      await client.playTrack(deviceId, { uris });
    } catch (err) {
      console.error("Shuffle failed:", err);
    }
  }, [client, isReady, deviceId]);
  const playTrack = useCallback(
    async (options) => {
      if (!deviceId) return;
      await client.playTrack(deviceId, options);
    },
    [client, deviceId]
  );
  const staticMenus = useMemo(
    () => getStaticMenuItems(signOut, shuffle),
    [signOut, shuffle]
  );
  const menuItems = useMenuItems(currentScreen, staticMenus, playTrack);
  const handleSelect = useCallback(() => {
    if (selectedIndex === -1) return;
    if (!menuItems) return;
    const currentItem = menuItems[selectedIndex];
    if (!currentItem) return;
    Promise.resolve(currentItem.action?.()).catch(
      (err) => console.error(`Menu action "${currentItem.label}" failed:`, err)
    );
    const route = currentItem.route;
    if (route) {
      setMenuStack((prev2) => [...prev2, route]);
      setSelectedIndex(-1);
    }
  }, [selectedIndex, currentScreen, menuItems]);
  const handleMenu = () => {
    if (menuStack.length > 1) {
      setMenuStack((prev2) => prev2.slice(0, -1));
      setSelectedIndex(0);
    } else {
      return;
    }
  };
  const handleScroll = useCallback(
    (delta) => {
      if (selectedIndex === -1) {
        setSelectedIndex(0);
      } else {
        const newIndex = selectedIndex + delta;
        const clampedIndex = Math.max(
          0,
          Math.min(newIndex, menuItems.length - 1)
        );
        setSelectedIndex(clampedIndex);
      }
    },
    [menuItems, currentScreen, selectedIndex]
  );
  const handlePlayPause = () => {
    togglePlayPause();
  };
  const handleNext = () => {
    next();
  };
  const handlePrev = () => {
    prev();
  };
  useEffect(() => {
    if (!prevTrackRef.current && currentTrack) {
      setMenuStack((prev2) => [...prev2, { screen: "NowPlaying" }]);
      setSelectedIndex(-1);
    }
    prevTrackRef.current = currentTrack;
  }, [currentTrack]);
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSelect();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        handleScroll(-1);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        handleScroll(1);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleSelect, handleScroll]);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: `ipod-scene flex flex-col items-center gap-2 pt-10 ${currentScreen.screen === "Solitaire" ? "ipod-game-scene" : ""}`,
      children: [
        /* @__PURE__ */ jsxs("div", { ref: itemRef, className: "ipod", children: [
          /* @__PURE__ */ jsx("div", { className: "ipod-body ipod-body-front", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col w-full", children: [
            /* @__PURE__ */ jsx("div", { className: "absolute left-1/2 -translate-x-1/2 mt-[24.5px]", children: /* @__PURE__ */ jsx(
              Screen,
              {
                selectedIndex,
                currentScreen: currentScreen.screen,
                onHover: setSelectedIndex,
                menuItems
              }
            ) }),
            /* @__PURE__ */ jsx("div", { className: "absolute top-[47%] left-1/2 -translate-x-1/2", children: /* @__PURE__ */ jsx(
              Wheel,
              {
                onMenu: handleMenu,
                onNext: handleNext,
                onPlayPause: handlePlayPause,
                onPrevious: handlePrev,
                onScroll: handleScroll,
                onSelect: handleSelect
              }
            ) })
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "ipod-body ipod-body-back" }),
          /* @__PURE__ */ jsx("div", { className: "ipod-body ipod-body-right" }),
          /* @__PURE__ */ jsx("div", { className: "ipod-body ipod-body-left" }),
          /* @__PURE__ */ jsx("div", { className: "ipod-body ipod-body-top" }),
          /* @__PURE__ */ jsx("div", { className: "ipod-body ipod-body-bottom" })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: resetPosition,
            className: "hover:text-ipod-blue z-1000",
            children: "reset position"
          }
        )
      ]
    }
  );
}
function meta({}) {
  return [{
    title: "iPod Nano"
  }];
}
const home = UNSAFE_withComponentProps(function Home() {
  return /* @__PURE__ */ jsx("div", {
    className: "flex items-center p-4 justify-center ",
    children: /* @__PURE__ */ jsx(Body, {})
  });
});
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: home,
  meta
}, Symbol.toStringTag, { value: "Module" }));
const SPOTIFY_REFRESH_COOKIE = "spotify-refresh-token";
async function loader({
  request
}) {
  const requestUrl = new URL(request.url);
  const tokenHash = requestUrl.searchParams.get("token_hash");
  if (tokenHash) {
    const {
      supabase,
      headers
    } = createSupabaseServerClient(request);
    const {
      error
    } = await supabase.auth.verifyOtp({
      type: "magiclink",
      token_hash: tokenHash
    });
    if (!error) {
      const redirectTo2 = requestUrl.searchParams.get("next") || "/";
      return redirect(redirectTo2, {
        headers
      });
    }
  }
  const code = requestUrl.searchParams.get("code");
  const redirectTo = requestUrl.searchParams.get("redirectTo") || "/";
  if (code) {
    const {
      supabase,
      headers
    } = createSupabaseServerClient(request);
    const {
      data: data2,
      error
    } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const refreshToken = data2.session.provider_refresh_token;
      if (refreshToken) {
        headers.append("Set-Cookie", serializeCookieHeader(SPOTIFY_REFRESH_COOKIE, refreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 365
        }));
      }
      return redirect(decodeURIComponent(redirectTo), {
        headers
      });
    }
  }
  return redirectWithError("/", "Error with signing in. Please try again.", {
    headers: new Headers()
  });
}
const route2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  loader
}, Symbol.toStringTag, { value: "Module" }));
const solitaire = UNSAFE_withComponentProps(function Solitaire() {
  return /* @__PURE__ */ jsx("div", {
    children: /* @__PURE__ */ jsx(SolitaireView, {})
  });
});
const route3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: solitaire
}, Symbol.toStringTag, { value: "Module" }));
async function action({
  request
}) {
  const {
    supabase,
    headers
  } = createSupabaseServerClient(request);
  if (request.method === "DELETE") {
    headers.append("Set-Cookie", serializeCookieHeader(SPOTIFY_REFRESH_COOKIE, "", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 0
    }));
    return data({
      ok: true
    }, {
      headers
    });
  } else if (request.method !== "POST") {
    return new Response("Request method not allowed", {
      status: 405
    });
  }
  const user = await supabase.auth.getUser();
  if (!user.data.user) return new Response("Couldn't find user", {
    status: 401
  });
  const refreshToken = parseCookieHeader(request.headers.get("Cookie") ?? "").find((c) => c.name === SPOTIFY_REFRESH_COOKIE)?.value;
  if (!refreshToken) {
    return data({
      error: "no refresh token"
    }, {
      status: 401,
      headers
    });
  }
  const basic = "Basic " + Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString("base64");
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: basic
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken
    })
  });
  if (!response.ok) {
    return data({
      error: response.statusText
    }, {
      status: 401,
      headers
    });
  }
  const json = await response.json();
  if (json.refresh_token) {
    headers.append("Set-Cookie", serializeCookieHeader(SPOTIFY_REFRESH_COOKIE, json.refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365
    }));
  }
  return data({
    access_token: json.access_token,
    expires_at: Date.now() + json.expires_in * 1e3
  }, {
    headers
  });
}
const route4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-DdpN-_JH.js", "imports": ["/assets/chunk-UIGDSWPH-OtVdA6fW.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": true, "module": "/assets/root-BGkT9i58.js", "imports": ["/assets/chunk-UIGDSWPH-OtVdA6fW.js", "/assets/PlaybackContext-D2qkt-Vg.js"], "css": ["/assets/root-D0BGEqxO.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/home": { "id": "routes/home", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/home-DwtCy3ff.js", "imports": ["/assets/chunk-UIGDSWPH-OtVdA6fW.js", "/assets/PlaybackContext-D2qkt-Vg.js", "/assets/SolitaireView-b17rbTZH.js"], "css": ["/assets/SolitaireView-BnkrAxld.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/callback": { "id": "routes/callback", "parentId": "root", "path": "callback", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/callback-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/solitaire": { "id": "routes/solitaire", "parentId": "root", "path": "solitaire", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/solitaire-CKi4BZlu.js", "imports": ["/assets/chunk-UIGDSWPH-OtVdA6fW.js", "/assets/SolitaireView-b17rbTZH.js"], "css": ["/assets/SolitaireView-BnkrAxld.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/api.spotify-token": { "id": "routes/api.spotify-token", "parentId": "root", "path": "api/spotify/token", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/api.spotify-token-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 } }, "url": "/assets/manifest-b1f9b8f6.js", "version": "b1f9b8f6", "sri": void 0 };
const assetsBuildDirectory = "build/client";
const basename = "/";
const future = { "v8_middleware": false, "unstable_optimizeDeps": false, "unstable_splitRouteModules": false, "unstable_subResourceIntegrity": false, "unstable_viteEnvironmentApi": false };
const ssr = true;
const isSpaMode = false;
const prerender = [];
const routeDiscovery = { "mode": "lazy", "manifestPath": "/__manifest" };
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/home": {
    id: "routes/home",
    parentId: "root",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route1
  },
  "routes/callback": {
    id: "routes/callback",
    parentId: "root",
    path: "callback",
    index: void 0,
    caseSensitive: void 0,
    module: route2
  },
  "routes/solitaire": {
    id: "routes/solitaire",
    parentId: "root",
    path: "solitaire",
    index: void 0,
    caseSensitive: void 0,
    module: route3
  },
  "routes/api.spotify-token": {
    id: "routes/api.spotify-token",
    parentId: "root",
    path: "api/spotify/token",
    index: void 0,
    caseSensitive: void 0,
    module: route4
  }
};
export {
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  prerender,
  publicPath,
  routeDiscovery,
  routes,
  ssr
};
