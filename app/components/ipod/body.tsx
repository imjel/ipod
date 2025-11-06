import { useState } from "react";
import Wheel from "./wheel";

export default function Body() {
  const [currentScreen, setCurrentScreen] = useState("menu");
  const [index, setIndex] = useState(0);
  const [menuStack, setMenuStack] = useState(["home"]); // layers of routes

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
    <div className="ipod-body flex w-full bg-blue-500 rounded-xl">
      <div className="flex flex-col">
        {/* screen goes here */}
        <Wheel />
      </div>
    </div>
  );
}
