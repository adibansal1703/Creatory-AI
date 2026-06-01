import { supabase } from "@/lib/supabase";
import type { ConnectedAccount, PostPlatform } from "@/lib/types/database";

async function requireUserId(): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new Error("You must be logged in.");
  return user.id;
}

export async function fetchConnectedAccounts(): Promise<ConnectedAccount[]> {
  await requireUserId();
  const { data, error } = await supabase
    .from("connected_accounts")
    .select("id, user_id, platform, account_name, external_account_id, is_connected, connected_at, created_at")
    .order("platform");

  if (error) throw new Error(error.message);
  return (data ?? []) as ConnectedAccount[];
}

export async function connectAccount(input: {
  platform: PostPlatform;
  accountName: string;
  externalAccountId?: string;
}): Promise<ConnectedAccount> {
  const userId = await requireUserId();

  const { data, error } = await supabase
    .from("connected_accounts")
    .upsert(
      {
        user_id: userId,
        platform: input.platform,
        account_name: input.accountName,
        external_account_id: input.externalAccountId ?? null,
        is_connected: true,
        connected_at: new Date().toISOString(),
      },
      { onConflict: "user_id,platform" },
    )
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as ConnectedAccount;
}

export async function disconnectAccount(platform: PostPlatform): Promise<void> {
  await requireUserId();
  const { error } = await supabase
    .from("connected_accounts")
    .update({ is_connected: false })
    .eq("platform", platform);

  if (error) throw new Error(error.message);
}

export async function hasConnectedAccount(): Promise<boolean> {
  const accounts = await fetchConnectedAccounts();
  return accounts.some((a) => a.is_connected);
}
