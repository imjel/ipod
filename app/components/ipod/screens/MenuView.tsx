export const MenuItems = ["Music", "Settings", "Shuffle Songs" ]
import { MdChevronRight } from "react-icons/md";

export default function MenuView () {
    return (
        <div>
            <ul className="cursor-pointer">
               {MenuItems.map((item) => <li className="flex flex-row justify-between px-1 items-center hover:bg-select hover:text-white" key={item}>{item} <MdChevronRight size={18}/></li>)}
            </ul>
        </div>
    );
}