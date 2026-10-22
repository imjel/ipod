import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("callback", "routes/callback.ts"),
  route("solitaire", "routes/solitaire.tsx"),
  route("api/spotify/token", "routes/api.spotify-token.ts"),
] satisfies RouteConfig;
