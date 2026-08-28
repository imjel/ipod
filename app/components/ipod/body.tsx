import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import Wheel from "./wheel";
import Screen from "./screen";
import { type iPodRoute } from "./routes/routes";
import { useAuth } from "~/context/AuthContext";
import { usePlayback } from "~/context/PlaybackContext";
import type { SpotifyTrack } from "~/lib/spotify.types";
import { useSpotify } from "~/hooks/useSpotify";
import { getStaticMenuItems } from "./routes/routes";
import { useMenuItems } from "~/hooks/useMenuItems";
import { useDragToRotate } from "~/hooks/useDragToRotate";

export default function Body() {
  const [menuStack, setMenuStack] = useState<iPodRoute[]>([{ screen: "home" }]); // layers of routes
  const currentScreen = menuStack[menuStack.length - 1];
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const { client, isReady } = useSpotify();
  const { signOut } = useAuth();
  const { currentTrack, togglePlayPause, next, prev, deviceId } = usePlayback();
  const prevTrackRef = useRef<SpotifyTrack | null>(null);
  const { itemRef, handleMouseDown, handleMouseMove, resetPosition } =
    useDragToRotate();

  const shuffle = useCallback(async () => {
    if (!isReady || !deviceId) return;
    await client.shuffle(true, deviceId);
    await client.play(deviceId);
  }, [client, isReady, deviceId]);

  const playTrack = useCallback(
    async (uri: string) => {
      if (!deviceId) return;
      await client.playTrack(deviceId, { uris: [uri] });
    },
    [client, deviceId],
  );

  const staticMenus = useMemo(
    () => getStaticMenuItems(signOut, shuffle),
    [signOut, shuffle],
  );
  const menuItems = useMenuItems(currentScreen, staticMenus, playTrack);

  const handleSelect = useCallback(() => {
    // navigation
    if (selectedIndex === -1) return;
    if (!menuItems) return;
    const currentItem = menuItems[selectedIndex];
    if (!currentItem) return;
    currentItem.action?.();
    const route = currentItem.route;
    if (route) {
      setMenuStack((prev) => [...prev, route]);
      setSelectedIndex(-1);
    }
  }, [selectedIndex, currentScreen, menuItems]);

  const handleMenu = () => {
    // send user back to the previous menu
    if (menuStack.length > 1) {
      setMenuStack((prev) => prev.slice(0, -1));
      // setCurrentScreen(menuStack[menuStack.length - 2]);
      setSelectedIndex(0);
    } else {
      return;
    }
  };

  // delta from wheel onScroll useCallback
  const handleScroll = useCallback(
    (delta: number) => {
      if (selectedIndex === -1) {
        //first scroll, so select the first item
        setSelectedIndex(0);
      } else {
        const newIndex = selectedIndex + delta;
        const clampedIndex = Math.max(
          0,
          Math.min(newIndex, menuItems.length - 1),
        );
        setSelectedIndex(clampedIndex);
      }
    },
    [menuItems, currentScreen, selectedIndex],
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
      setMenuStack((prev) => [...prev, { screen: "NowPlaying" }]);
      setSelectedIndex(-1);
    }
    prevTrackRef.current = currentTrack;
  }, [currentTrack]);

  // key board events for enter & arrow keys (navigation)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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

  return (
    <div className="ipod-scene flex flex-col items-center gap-2 pt-10">
      <div
        ref={itemRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        className="ipod"
      >
        <div className="ipod-body ipod-body-front">
          <div className="flex flex-col w-full">
            <div className="absolute left-1/2 -translate-x-1/2 mt-[24.5px]">
              <Screen
                selectedIndex={selectedIndex}
                currentScreen={currentScreen.screen}
                onHover={setSelectedIndex}
                menuItems={menuItems}
              />
            </div>
            <div className="absolute top-[47%] left-1/2 -translate-x-1/2">
              <Wheel
                onMenu={handleMenu}
                onNext={handleNext}
                onPlayPause={handlePlayPause}
                onPrevious={handlePrev}
                onScroll={handleScroll}
                onSelect={handleSelect}
              />
            </div>
          </div>
        </div>
        <div className="ipod-body ipod-body-back"></div>
        <div className="ipod-body ipod-body-right"></div>
        <div className="ipod-body ipod-body-left"></div>
        <div className="ipod-body ipod-body-top"></div>
        <div className="ipod-body ipod-body-bottom"></div>
      </div>
      <button
        type="button"
        onClick={resetPosition}
        className="hover:text-ipod-blue z-1000"
      >
        reset position
      </button>
    </div>
  );
}
