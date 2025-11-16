/**
 * wheel is input component
 * detects user interactions & sends to controller:
 *  - scrolling on outer wheel
 *  - play/pause
 *  - fast forward/backward
 *  - select
 *  - menu
 */
import { FaFastForward, FaFastBackward } from "react-icons/fa";
import { IoMdPause, IoMdPlay } from "react-icons/io";
import { useState, useRef, useEffect } from "react";
import type {MouseEvent} from "react";

interface WheelProps {
  onScroll?: (delta: number) => void;
  onSelect?: () => void;
  onMenu?: () => void;
  onPlayPause?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
}

export default function Wheel({
  onScroll,
  onSelect,
  onMenu,
  onPlayPause,
  onNext,
  onPrevious,
}: WheelProps) {
  const [scrolling, setScrolling] = useState(false);
  const wheelRef = useRef<HTMLDivElement>(null);
  const lastAngleRef = useRef<number>(0);
  const timer = useRef<boolean | null>(null);

  // get mouse angle from the center of the wheel
  const getAngle = (clientX: number, clientY: number): number => {
    if (!wheelRef.current) return 0;
    
    const rect = wheelRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // change in x and y from client's mouse to center of wheel
    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;

    // angle (in radians) between the X axis and the line going through both the origin and the given point
    return Math.atan2(deltaY, deltaX) * (180 / Math.PI);

  };

  const handleWheelStart = (clientX: number, clientY: number) => {
    setScrolling(true);
    lastAngleRef.current = getAngle(clientX, clientY);
  };

  const handleWheelMove = (clientX: number, clientY: number) => {
    if(!scrolling) console.log("not scrolling");
    if(!onScroll) console.log("no onScroll");

    if(!scrolling || !onScroll) return;

    const currentAngle = getAngle(clientX, clientY);
    let delta = currentAngle - lastAngleRef.current;

    // if angle is wraparound, handle
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;

    // scroll event if movement is notable/should cause scroll (over 10deg)
    if (Math.abs(delta) > 10) {
      console.log("debug: scroll!", delta > 0 ? 1 : -1);
      onScroll(delta > 0 ? 1 : -1); // scroll +1 for clockwise, -1 counter-clockwise
      lastAngleRef.current = currentAngle;
    }
  };

  const handleWheelEnd = () => {
    setScrolling(false);
  };

    // detect scroll (wheel events) -- have to use a useEffect to prevent default scrolling bc React 
    useEffect(() => {
      const wheelElement = wheelRef.current;
      if (!wheelElement) return;
  
      const handleWheel = (e: WheelEvent) => {
        e.preventDefault();
        if (!onScroll) return;
        if (timer.current) return;
    
        timer.current = true;
        setTimeout(() => {
          timer.current = false;
        }, 100);
    
        // positive deltaY = scroll down, negative = scroll up; +1 clockwise, -1 counterclockwise
        onScroll(e.deltaY > 0 ? 1 : -1);
      };
  
      wheelElement.addEventListener("wheel", handleWheel, {passive: false});
      return () => {
        wheelElement.removeEventListener("wheel", handleWheel);
      }
    }, [onScroll]);

  // mouse events
  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    console.log("debug: mouse down", e.target);
    handleWheelStart(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    handleWheelMove(e.clientX, e.clientY);
  }

  const handleMouseUp = () => {
    handleWheelEnd();
  }

  return (
    <div 
      ref={wheelRef} 
      className="wheel relative flex items-center justify-center rounded-full bg-white border-2 border-ipod-blue-border w-62 h-62 shadow-sm select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseUp}
      onMouseUp={handleMouseUp}
    >
      {/*Buttons */}
      <button className="absolute top-2.5 left-1/2 -translate-x-1/2 text-wheel-text text-lg font-semibold" onClick={onMenu}>
        MENU
      </button>
      <button className="absolute right-3 bottom-1/2 translate-y-1/2 text-wheel-text" onClick={onNext}> 
        {<FaFastForward size={20} className="text-wheel-text " />}
      </button>
      <button className="absolute left-3 bottom-1/2 translate-y-1/2" onClick={onPrevious}>
        {<FaFastBackward size={20} className="text-wheel-text" />}
      </button>
      <button className="absolute bottom-2.5 left-1/2 -translate-x-1/2 text-md" onClick={onPlayPause}>
        <span className="flex flex-row">
          <IoMdPlay size={18} className="text-wheel-text" />
          <IoMdPause size={18} className="text-wheel-text" />
        </span>
      </button>
      {/* select button */}
      <button className="wheel-select-button rounded-full bg-ipod-blue w-28 h-28" onClick={onSelect} />
    </div>
  );
}
