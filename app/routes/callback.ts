import { redirect } from "react-router";
import { redirectWithError } from "remix-toast";
import { createSupabaseServerClient } from "~/lib/supabase.server";
import type { Route } from "./+types/callback";
import { serializeCookieHeader } from "@supabase/ssr";
import { SPOTIFY_REFRESH_COOKIE } from "~/lib/auth.types";

export async function loader({ request }: Route.LoaderArgs) {
  const requestUrl = new URL(request.url);
  const tokenHash = requestUrl.searchParams.get("token_hash");

  if (tokenHash) {
    const { supabase, headers } = createSupabaseServerClient(request);
    const { error } = await supabase.auth.verifyOtp({
      type: "magiclink",
      token_hash: tokenHash,
    });
    if (!error) {
      const redirectTo = requestUrl.searchParams.get("next") || "/";
      return redirect(redirectTo, { headers });
    }
  }

  const code = requestUrl.searchParams.get("code");
  const redirectTo = requestUrl.searchParams.get("redirectTo") || "/";
  if (code) {
    const { supabase, headers } = createSupabaseServerClient(request);
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const refreshToken = data.session.provider_refresh_token;
      if (refreshToken) {
        headers.append(
          "Set-Cookie",
          serializeCookieHeader(SPOTIFY_REFRESH_COOKIE, refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 365,
          }),
        );
      }
      return redirect(decodeURIComponent(redirectTo), { headers });
    }
  }
  // return the user to an error page with instructions
  return redirectWithError("/", "Error with signing in. Please try again.", {
    headers: new Headers(),
  });
}
