import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import Wheel from "./wheel";
import Screen from "./screen";
import { type SideEnum, getMenuItems } from "./types";
import { useAuth } from "~/context/AuthContext";
import { usePlayback } from "~/context/PlaybackContext";
import type { SpotifyTrack } from "~/lib/spotify.types";
import { useSpotify } from "~/hooks/useSpotify";

export default function Body() {
  const [currentScreen, setCurrentScreen] = useState("home");
  const [menuStack, setMenuStack] = useState(["home"]); // layers of routes
  const [currentSide, setCurrentSide] = useState<SideEnum>("front");
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const { client, isReady } = useSpotify();
  const { signOut } = useAuth();
  const { currentTrack, togglePlayPause, next, prev, deviceId } = usePlayback();
  const prevTrackRef = useRef<SpotifyTrack | null>(null);

  const shuffle = async () => {
    if (!isReady || !deviceId) return;
    await client.shuffle(true, deviceId);
    await client.play(deviceId);
  };

  const menuItems = useMemo(
    () => getMenuItems(signOut, shuffle),
    [signOut, shuffle],
  );

  const handleSelect = useCallback(() => {
    // navigation
    if (selectedIndex === -1) return;
    const currentItem = menuItems[currentScreen][selectedIndex];
    switch (currentItem.type) {
      case "submenu":
        setMenuStack((prev) => [...prev, currentItem.route]);
        setCurrentScreen(currentItem.route);
        setSelectedIndex(-1);
        break;
      case "action":
        currentItem.action();
        break;
      case "song":
        // play song from spotify player
        break;
    }
  }, [selectedIndex, currentScreen, menuItems]);

  const handleMenu = () => {
    // send user back to the previous menu
    if (menuStack.length > 1) {
      setMenuStack((prev) => prev.slice(0, -1));
      setCurrentScreen(menuStack[menuStack.length - 2]);
      setSelectedIndex(0);
    } else {
      return;
    }
  };

  // delta from wheel onScroll useCallback
  const handleScroll = useCallback(
    (delta: number) => {
      const items = menuItems[currentScreen] || [];
      if (selectedIndex === -1) {
        //first scroll, so select the first item
        setSelectedIndex(0);
      } else {
        const newIndex = selectedIndex + delta;
        const clampedIndex = Math.max(0, Math.min(newIndex, items.length - 1));
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

  const handleSideChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentSide(e.target.value as SideEnum);
  };

  useEffect(() => {
    if (!prevTrackRef.current && currentTrack) {
      setMenuStack((prev) => [...prev, "NowPlaying"]);
      setCurrentScreen("NowPlaying");
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
      <div className={`ipod show-${currentSide}`}>
        <div className="ipod-body ipod-body-front">
          <div className="flex flex-col w-full">
            {/* <Screen /> */}
            <div className="absolute left-1/2 -translate-x-1/2 mt-[24.5px]">
              <Screen
                selectedIndex={selectedIndex}
                currentScreen={currentScreen}
                onHover={setSelectedIndex}
                menuItems={menuItems}
              />
            </div>
            {/* control wheel */}
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
      <div className="radio-group flex flex-row gap-2">
        <label>
          <input
            type="radio"
            name="rotate-ipod-side"
            value="front"
            checked={currentSide === "front"}
            onChange={handleSideChange}
          />{" "}
          front
        </label>
        <label>
          <input
            type="radio"
            name="rotate-ipod-side"
            value="right"
            checked={currentSide === "right"}
            onChange={handleSideChange}
          />{" "}
          right
        </label>
        <label>
          <input
            type="radio"
            name="rotate-ipod-side"
            value="back"
            checked={currentSide === "back"}
            onChange={handleSideChange}
          />{" "}
          back
        </label>
        <label>
          <input
            type="radio"
            name="rotate-ipod-side"
            value="left"
            checked={currentSide === "left"}
            onChange={handleSideChange}
          />{" "}
          left
        </label>
        <label>
          <input
            type="radio"
            name="rotate-ipod-side"
            value="top"
            checked={currentSide === "top"}
            onChange={handleSideChange}
          />{" "}
          top
        </label>
        <label>
          <input
            type="radio"
            name="rotate-ipod-side"
            value="bottom"
            checked={currentSide === "bottom"}
            onChange={handleSideChange}
          />{" "}
          bottom
        </label>
      </div>
    </div>
  );
}
