/**
 * view component that renders based on currentScreen prop
 */
import { useRef, useState } from "react";
import ScreenHeader from "./screens/ScreenHeader";
import MenuView from "./screens/MenuView";
import { useAuth } from "~/context/AuthContext";
import LoginView from "./screens/LoginView";
import type { MenuItem } from "./types";
import NowPlayingView from "./screens/NowPlayingView";

export interface ScreenProps {
  selectedIndex: number;
  currentScreen: string;
  onHover?: (index: number) => void;
  menuItems: Record<string, MenuItem[]>;
}

export default function Screen({
  selectedIndex,
  currentScreen,
  onHover,
  menuItems,
}: ScreenProps) {
  const { user, isLoading, signInWithSpotify } = useAuth();
  const screenRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const timer = useRef<boolean | null>(null);

  // put below in request animation frame to wait until render to run
  // should know mouse location w/o getting rect
  // every mouse move tracks delta from last move
  // store in ref to avoid rerender (as state)
  // use value without rerendering
  // use css transitions to smooth between 1 step and another
  // that way, only run every x milliseconds

  //1. define function outside of render cycle
  //2. useCallback to memoize
  // 3. put inside of a request animation frame, or debounce

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
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

  // check if there is an active timer
  // if so, return
  // else, create a new timeout to set value
  // function that sets value should also clear timeout
  // ms value set is min amt of time that has to pass before updated again in refresh cycle

  const renderScreen = () => {
    if (currentScreen === "NowPlaying") {
      return <NowPlayingView />;
    } else {
      return (
        <MenuView
          selectedIndex={selectedIndex}
          currentScreen={currentScreen}
          onHover={onHover}
          menuItems={menuItems}
        />
      );
    }
  };

  return (
    <div
      ref={screenRef}
      onMouseMove={handleMouseMove}
      className="screen-class flex flex-col bg-screen border-2 border-screen-border w-64 h-48 shadow-[inset_0_-1px_2px_rgba(0,0,0,0.4)]"
    >
      {!user ? (
        <LoginView onSignIn={signInWithSpotify} isLoading={isLoading} />
      ) : (
        <>
          <ScreenHeader />
          {renderScreen()}
        </>
      )}
      <div
        className="screen-overlay"
        style={
          {
            transform: `translate3d(${mousePosition.x}px, ${mousePosition.y}px, 0px)`,
          } as React.CSSProperties
        }
      ></div>
    </div>
  );
}
