import type { User } from "@supabase/supabase-js";

import { getSupabaseAdmin } from "@/lib/supabase/admin.server";

export async function requireServerUser(accessToken: string): Promise<User> {
  console.log("[server-auth] Validating access token...");
  const { data, error } = await getSupabaseAdmin().auth.getUser(accessToken);

  if (error) {
    console.error("[server-auth] Error validating token:", error);
    throw new Error("You must be logged in.");
  }

  if (!data.user) {
    console.error("[server-auth] No user found for token");
    throw new Error("You must be logged in.");
  }

  console.log("[server-auth] User validated successfully:", data.user.id);
  return data.user;
}
