import { menuItems } from "../types";
import { MdChevronRight } from "react-icons/md";
import type { ScreenProps } from "../screen";

export default function MenuView({
  selectedIndex,
  currentScreen,
  onHover,
}: ScreenProps) {
  const items = menuItems[currentScreen] || [];
  return (
    <div>
      <ul className="cursor-pointer">
        {items.map((item, index) => (
          <li
            className={`flex flex-row justify-between px-1 items-center ${index === selectedIndex ? "bg-select text-white" : "hover:bg-select hover:text-white"}`}
            key={item.label}
            onMouseEnter={() => onHover?.(index)}
          >
            {item.label}
            {item.type === "submenu" && <MdChevronRight size={18} />}
          </li>
        ))}
      </ul>
    </div>
  );
}
