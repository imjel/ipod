type IpodColor = { label: string; code: string };

export const IPOD_COLORS = [
  {
    label: "Pink",
    code: "#d7499b",
  },
  {
    label: "Blue",
    code: "#02abd6",
  },
  { label: "Gray", code: "#e7e9e8" },
  {
    label: "Green",
    code: "#afd157",
  },
  {
    label: "Black",
    code: "#0e2632",
  },
];

export function setColor(color: IpodColor) {
  document.documentElement.style.setProperty("--color-ipod-base", color.code);
}
