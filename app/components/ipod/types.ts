export type SideEnum = "front" | "back" | "right" | "left" | "top" | "bottom";
import { IPOD_COLORS, setColor } from "~/hooks/setColor";

export const getMenuItems = (
  signOut: () => Promise<void>,
  shuffle: () => Promise<void>,
): Record<string, MenuItem[]> => ({
  home: [
    { type: "submenu", label: "Music", route: "Music" },
    { type: "submenu", label: "Settings", route: "Settings" },
    {
      type: "action",
      label: "Shuffle Songs",
      action: () => {
        shuffle();
      },
    },
  ],
  Music: [
    { type: "submenu", label: "Playlists", route: "Playlists" },
    { type: "submenu", label: "Artists", route: "Artists" },
    { type: "submenu", label: "Albums", route: "Albums" },
    { type: "submenu", label: "Songs", route: "Songs" },
    { type: "submenu", label: "Now Playing", route: "NowPlaying" },
  ],
  Settings: [
    { type: "submenu", label: "About", route: "About" },
    {
      type: "action",
      label: "Logout",
      action: () => {
        signOut();
      },
    },
    { type: "submenu", label: "Change Color", route: "Colors" },
  ],
  Colors: IPOD_COLORS.map((color) => ({
    type: "action",
    label: color.label,
    action: () => setColor(color),
  })),
});

export type MenuItem =
  | { type: "submenu"; label: string; route: string }
  | { type: "action"; label: string; action: () => void }
  | { type: "song"; label: string; trackId: string; artist?: string };
