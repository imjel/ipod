import type { Route } from "./+types/api.spotify-token";
import { parseCookieHeader, serializeCookieHeader } from "@supabase/ssr";
import { data } from "react-router";
import { createSupabaseServerClient } from "~/lib/supabase.server";
import { SPOTIFY_REFRESH_COOKIE } from "~/lib/auth.types";

export async function action({ request }: Route.ActionArgs) {
  const { supabase, headers } = createSupabaseServerClient(request);

  if (request.method === "DELETE") {
    headers.append(
      "Set-Cookie",
      serializeCookieHeader(SPOTIFY_REFRESH_COOKIE, "", {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 0,
      }),
    );
    return data({ ok: true }, { headers });
  } else if (request.method !== "POST") {
    return new Response("Request method not allowed", { status: 405 });
  }
  const user = await supabase.auth.getUser();
  if (!user.data.user)
    return new Response("Couldn't find user", { status: 401 });

  const refreshToken = parseCookieHeader(
    request.headers.get("Cookie") ?? "",
  ).find((c) => c.name === SPOTIFY_REFRESH_COOKIE)?.value;
  if (!refreshToken) {
    return data({ status: 401 }, { headers });
  }

  const basic =
    "Basic " +
    Buffer.from(
      `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`,
    ).toString("base64");

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: basic,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    return data({ status: 401 }, { headers });
  }

  const json = await response.json();

  if (json.refresh_token) {
    headers.append(
      "Set-Cookie",
      serializeCookieHeader(SPOTIFY_REFRESH_COOKIE, json.refresh_token, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      }),
    );
  }

  return data(
    {
      access_token: json.access_token,
      expires_at: Date.now() + json.expires_in * 1000,
    },
    { headers },
  );
}
