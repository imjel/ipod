import { FaPlay, FaFastForward, FaFastBackward, FaPause } from "react-icons/fa"

function handleClickMenu() {

}

export default function Wheel () {
    return (
        <div className="rounded-full bg-white border border-gray-50">
            <button className="text-gray-100 text-md" onClick={handleClickMenu}>
                MENU
            </button>
            <button className="text-gray-100 text-md">
                {<FaFastForward size={24} className="text-gray-100"/>}
            </button>
            <button className="text-gray-100 text-md">
                {<FaFastBackward size={24} className="text-gray-100"/>}
            </button>
            <button className="text-gray-100 text-md">
                {<FaPause size={24} className="text-gray-100"/>}
            </button>
        </div>
    )
}