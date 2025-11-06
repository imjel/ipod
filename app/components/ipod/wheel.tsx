/**
 * wheel is input component
 * detects user interactions & sends to controller:
 *  - scrolling on outer wheel
 *  - play/pause
 *  - fast forward/backward
 *  - select
 *  - menu
 */
import { FaPlay, FaFastForward, FaFastBackward, FaPause } from "react-icons/fa";

interface WheelProps {
    onMenu
    onSelect
    onScroll
    onPlay
    onNext
    onPrevious
}

export default function Wheel() {

  return (
    <div className="rounded-full bg-white border border-gray-50">
      <button className="text-gray-100 text-md">
        MENU
      </button>
      <button className="text-gray-100 text-md">
        {<FaFastForward size={24} className="text-gray-100" />}
      </button>
      <button className="text-gray-100 text-md">
        {<FaFastBackward size={24} className="text-gray-100" />}
      </button>
      <button className="text-gray-100 text-md">
        {<FaPause size={24} className="text-gray-100" />}
      </button>
    </div>
  );
}
