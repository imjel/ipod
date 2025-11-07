import { useState } from "react";
import Wheel from "./wheel";
import Screen from "./screen";

export default function Body() {
  const [currentScreen, setCurrentScreen] = useState("menu");
  const [delta, setDelta] = useState(0);
  const [menuStack, setMenuStack] = useState(["home"]); // layers of routes
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

  return (
    <div className="ipod-body relative flex w-[305px] h-[690px] bg-ipod-blue rounded-sm">
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
  );
}
