import Wheel from "./wheel"

export default function Body () {
    return (
        <div className="flex w-full bg-blue-500 rounded-xl">
            <div className="flex flex-col">
                {/* screen goes here */}
                <Wheel />
            </div>
        </div>
    )
}