import Battery from "./Battery"

export default function ScreenHeader() {
    return (
        <div className="flex flex-row border-b border-[#237FAE] bg-screen shadow-inner w-full h-6 items-center justify-between font-semibold">
            <h1 className="flex-1 text-center ml-8">iPod</h1>
            <div className="mr-1">
            <Battery />
            </div>
            
        </div>
    )
}