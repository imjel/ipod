import { MdChevronRight } from "react-icons/md";
import type { ScreenProps } from "../screen";

export default function MenuView({
  selectedIndex,
  onHover,
  menuItems,
}: ScreenProps) {
  return (
    <div className="overflow-y-auto">
      <ul className="ipod-menu">
        {menuItems.map((item, index) => (
          <li
            className="ipod-menu-item"
            key={item.label}
            onMouseEnter={() => onHover?.(index)}
            data-selected={index === selectedIndex}
          >
            <span className="w-full truncate">{item.label}</span>
            {item.route && <MdChevronRight size={18} />}
          </li>
        ))}
      </ul>
    </div>
  );
}
