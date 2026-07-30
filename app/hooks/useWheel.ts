import { useState, useRef, useEffect } from "react";
import type { MouseEvent } from "react";

interface useWheelArgs {
  onScroll?: (delta: number) => void;
}

export function useWheel({ onScroll }: useWheelArgs) {
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
    if (!scrolling || !onScroll) return;

    const currentAngle = getAngle(clientX, clientY);
    let delta = currentAngle - lastAngleRef.current;

    // if angle is wraparound, handle
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;

    // scroll event if movement is notable/should cause scroll (over 10deg)
    if (Math.abs(delta) > 10) {
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

    wheelElement.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      wheelElement.removeEventListener("wheel", handleWheel);
    };
  }, [onScroll]);

  // mouse events
  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleWheelStart(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
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
    wheelRef,
  };
}
