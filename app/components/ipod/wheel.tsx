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
import { useWheel } from "~/hooks/useWheel";

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
  const { wheelRef, handleMouseDown, handleMouseMove, handleMouseUp } =
    useWheel({ onScroll });

  return (
    <div
      ref={wheelRef}
      className="wheel relative flex items-center justify-center rounded-full bg-white border-2 border-ipod-border w-62 h-62 shadow-sm select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseUp}
      onMouseUp={handleMouseUp}
    >
      {/*Buttons */}
      <button
        className="absolute top-2.5 left-1/2 -translate-x-1/2 text-wheel-text text-lg font-semibold"
        onClick={onMenu}
      >
        MENU
      </button>
      <button
        className="absolute right-3 bottom-1/2 translate-y-1/2 text-wheel-text"
        onClick={onNext}
      >
        {<FaFastForward size={20} className="text-wheel-text " />}
      </button>
      <button
        className="absolute left-3 bottom-1/2 translate-y-1/2"
        onClick={onPrevious}
      >
        {<FaFastBackward size={20} className="text-wheel-text" />}
      </button>
      <button
        className="absolute bottom-2.5 left-1/2 -translate-x-1/2 text-md"
        onClick={onPlayPause}
      >
        <span className="flex flex-row">
          <IoMdPlay size={18} className="text-wheel-text" />
          <IoMdPause size={18} className="text-wheel-text" />
        </span>
      </button>
      {/* select button */}
      <button className="ipod-select-button" onClick={onSelect} />
    </div>
  );
}
