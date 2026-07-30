import { MdChevronRight } from "react-icons/md";
import type { ScreenProps } from "../screen";

export default function MenuView({
  selectedIndex,
  onHover,
  menuItems,
}: ScreenProps) {
  return (
    <div className="overflow-y-auto">
      <ul className="cursor-pointer">
        {menuItems.map((item, index) => (
          <li
            className={`flex flex-row justify-between px-1 items-center font-regular font-helvetica ${index === selectedIndex ? "bg-select text-white" : "hover:bg-select hover:text-white"}`}
            key={item.label}
            onMouseEnter={() => onHover?.(index)}
          >
            <span className="w-full truncate">{item.label}</span>
            {item.route && <MdChevronRight size={18} />}
          </li>
        ))}
      </ul>
    </div>
  );
}
