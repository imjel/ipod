export type SideEnum = "front" | "back" | "right" | "left" | "top" | "bottom";
import { IPOD_COLORS, setColor } from "~/hooks/setColor";

export type iPodRoute =
  | { screen: "home" }
  | { screen: "Music" }
  | { screen: "Settings" }
  | { screen: "Colors" }
  | { screen: "About" }
  | { screen: "Playlists" }
  | { screen: "PlaylistTracks"; playlistId: string }
  | { screen: "NowPlaying" };

export type Screen = iPodRoute["screen"];

export type MenuItem = {
  label: string;
  action?: () => void;
  route?: iPodRoute;
};

export function getStaticMenuItems(
  signOut: () => Promise<void>,
  shuffle: () => Promise<void>,
): Partial<Record<Screen, MenuItem[]>> {
  return {
    home: [
      { label: "Music", route: { screen: "Music" } },
      { label: "Settings", route: { screen: "Settings" } },
      { label: "Shuffle Songs", action: () => shuffle() },
    ],
    Music: [
      { label: "Playlists", route: { screen: "Playlists" } },
      // { label: "Artists", route: { screen: "Artists" } },
      // { label: "Albums", route: "Albums" },
      // { label: "Songs", route: "Songs" },
      { label: "Now Playing", route: { screen: "NowPlaying" } },
    ],
    Settings: [
      { label: "About", route: { screen: "About" } },
      {
        label: "Logout",
        action: () => {
          signOut();
        },
      },
      { label: "Change Color", route: { screen: "Colors" } },
    ],
    Colors: IPOD_COLORS.map((color) => ({
      label: color.label,
      action: () => setColor(color),
    })),
  };
}
