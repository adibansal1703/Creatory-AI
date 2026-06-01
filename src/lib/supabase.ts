import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

/**
 * Browser client with cookie-backed PKCE storage so email verification links
 * work across tabs and survive better than localStorage-only verifiers.
 */
function createClient(): SupabaseClient {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

let browserClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (typeof window !== "undefined") {
    if (!browserClient) {
      browserClient = createClient();
    }
    return browserClient;
  }

  if (!browserClient) {
    browserClient = createClient();
  }
  return browserClient;
}

/** @deprecated Prefer getSupabase() — kept for existing imports */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const client = getSupabase();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
