/**
 * view component that renders based on currentScreen prop
 */
import { useRef, useState } from "react";
import ScreenHeader from "./screens/ScreenHeader";
import MenuView from "./screens/MenuView";

export default function Screen() {
  // const toRender = switch(currentScreen){
  //     case "menu":
  //         return (
  //             <MenuView />
  //         )
  //         // render menuview
  //     default:
  //         return (
  //             <MenuView />
  //         )
  // }
  const screenRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!screenRef.current) return;

    const rect = screenRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setMousePosition({ x, y });
  };

  return (
    <div 
        ref={screenRef}
        onMouseMove={handleMouseMove}
        style={{
            "--mouse-x": `${mousePosition.x}px`,
            "--mouse-y": `${mousePosition.y}px`
        } as React.CSSProperties}
        className="screen-class justify-center bg-screen border-2 border-screen-border w-64 h-48 shadow-sm"
    >   
        <ScreenHeader />
        <MenuView />
    </div>
  )
}
