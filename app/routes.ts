import { type RouteConfig, index } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    // route("auth", "routes/auth.tsx"),
    // route("playlists", "routes/playlists.tsx"),
    // route ("settings", "routes/settings.tsx"),
] satisfies RouteConfig;
