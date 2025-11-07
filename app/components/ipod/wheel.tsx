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

export default function Wheel() {
  return (
    <div className="relative flex items-center justify-center rounded-full bg-white border-2 border-ipod-blue-border w-64 h-64 shadow-sm">
      <button className="absolute top-2 left-1/2 -translate-x-1/2 text-wheel-text text-md font-semibold">
        MENU
      </button>
      <button className="absolute right-2 bottom-1/2 translate-y-1/2 text-wheel-text">
        {<FaFastForward size={22} className="text-wheel-text " />}
      </button>
      <button className="absolute left-2 bottom-1/2 translate-y-1/2 ">
        {<FaFastBackward size={22} className="text-wheel-text" />}
      </button>
      <button className="absolute bottom-2 left-1/2 -translate-x-1/2 text-md">
        <span className="flex flex-row">
          <IoMdPlay size={20} className="text-wheel-text" />
          <IoMdPause size={20} className="text-wheel-text" />
        </span>
      </button>
      {/* select button */}
      <button className="rounded-full bg-ipod-blue w-32 h-32" />
    </div>
  );
}
