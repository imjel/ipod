import { useState } from "react";
import Wheel from "./wheel";
import Screen from "./screen";

type SideEnum = "front" | "back" | "right" | "left" | "top" | "bottom";

export default function Body() {
  const [currentScreen, setCurrentScreen] = useState("menu");
  const [delta, setDelta] = useState(0);
  const [menuStack, setMenuStack] = useState(["home"]); // layers of routes
  const [currentSide, setCurrentSide] = useState<SideEnum>("front");

  //   const {user, playlists} = useSpotify();

  // const handleScroll = (index: number) => {
  //     setIndex(prev => {
  //         /** implement scroll logic */
  //     })
  // }

  const handleSelect = () => {
    // navigation
  };

  const handleMenu = () => {
    // send user back to the previous menu
    setMenuStack((prev) => prev.slice(0, -1));
    setCurrentScreen(menuStack[menuStack.length - 2]);
  };

  const handleSideChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentSide(e.target.value as SideEnum);
  };

  return (
    <div className="ipod-scene flex flex-col items-center gap-2 pt-10">
      <div className={`ipod show-${currentSide}`}>
        <div className="ipod-body ipod-body-front">
          <div className="flex flex-col w-full">
            {/* <Screen /> */}
            <div className="absolute left-1/2 -translate-x-1/2 mt-[24.5px]">
              <Screen />
            </div>
            {/* control wheel */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2">
              {/* <Wheel 
            onMenu={handleMenu}
            onNext={}
            onPlayPause={}
            onPrevious={}
            onScroll={handleScroll}
            onSelect={handleSelect}
          /> */}
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
