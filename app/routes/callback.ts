import { redirect } from "react-router";
import { redirectWithError } from "remix-toast";
import { createSupabaseServerClient } from "~/lib/supabase.server";
import type { Route } from "./+types/callback";

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
      console.log("SUCCESSFULLY SIGNED IN WITH TOKEN HASH");

      const redirectTo = requestUrl.searchParams.get("next") || "/";
      return redirect(redirectTo, { headers });
    }
    console.log("FAILED TO EXCHANGE CODE FOR SESSION");
  }

  const code = requestUrl.searchParams.get("code");
  const redirectTo = requestUrl.searchParams.get("redirectTo") || "/";
  if (code) {
    const { supabase, headers } = createSupabaseServerClient(request);
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return redirect(decodeURIComponent(redirectTo), { headers });
    }
  }

  // return the user to an error page with instructions
  return redirectWithError("/", "Error with signing in. Please try again.", {
    headers: new Headers(),
  });
}
