type iPodColor = { label: string };

export const IPOD_COLORS: iPodColor[] = [
  {
    label: "Pink",
  },
  {
    label: "Blue",
  },
  { label: "Gray" },
  {
    label: "Green",
  },
  {
    label: "Black",
  },
];

export function setColor(color: iPodColor) {
  document.documentElement.dataset.ipodColor = color.label.toLowerCase();
  localStorage.setItem("ipod-color", color.label.toLowerCase());
}
