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
import { useState, useRef } from "react";
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

  // get angle from the center of the wheel
  const getAngle = (clientX: number, clientY: number): number => {
    if (!wheelRef.current) return 0;
    
    const rect = wheelRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // change in x and y from client to center of wheel
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
    if(!scrolling || !onScroll) return;

    const currentAngle = getAngle(clientX, clientY);
    let delta = currentAngle - lastAngleRef.current;

    // if angle is wraparound, handle
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;

    // scroll event if movement is notable/should cause scroll
    if (Math.abs(delta) > 10) {
      onScroll(delta > 0 ? 1 : -1);
      lastAngleRef.current = currentAngle;
    }
  };

  const handleWheelEnd = () => {
    setScrolling(false);
  };

  // mouse events
  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    handleWheelStart(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    handleWheelMove(e.clientX, e.clientY);
  }

  const handleMouseUp = () => {
    handleWheelEnd();
  }

  // touch events for mobile

  return (
    <div 
      ref={wheelRef} 
      className="relative flex items-center justify-center rounded-full bg-white border-2 border-ipod-blue-border w-64 h-64 shadow-sm select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseUp}
      onMouseUp={handleMouseUp}
    >
      {/*Buttons */}
      <button className="absolute top-2 left-1/2 -translate-x-1/2 text-wheel-text text-md font-semibold" onClick={onMenu}>
        MENU
      </button>
      <button className="absolute right-2 bottom-1/2 translate-y-1/2 text-wheel-text" onClick={onNext}> 
        {<FaFastForward size={22} className="text-wheel-text " />}
      </button>
      <button className="absolute left-2 bottom-1/2 translate-y-1/2" onClick={onPrevious}>
        {<FaFastBackward size={22} className="text-wheel-text" />}
      </button>
      <button className="absolute bottom-2 left-1/2 -translate-x-1/2 text-md" onClick={onPlayPause}>
        <span className="flex flex-row">
          <IoMdPlay size={20} className="text-wheel-text" />
          <IoMdPause size={20} className="text-wheel-text" />
        </span>
      </button>
      {/* select button */}
      <button className="rounded-full bg-ipod-blue w-32 h-32" onClick={onSelect} />
    </div>
  );
}
