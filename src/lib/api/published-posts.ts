import { enqueueNotification } from "@/lib/api/notifications";
import { supabase } from "@/lib/supabase";
import type { ContentPayload, PostPlatform } from "@/lib/types/database";

async function requireUserId(): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new Error("You must be logged in.");
  return user.id;
}

export function summarizeContent(platform: PostPlatform, payload: ContentPayload): string {
  const p = payload[platform];
  if (!p) return "";
  if (platform === "youtube") {
    return [p.title, p.description, p.tags].filter(Boolean).join("\n\n");
  }
  if (platform === "instagram") {
    return [p.caption, p.hashtags, p.location, p.tagged_accounts].filter(Boolean).join("\n\n");
  }
  return (p.content as string) || (p.caption as string) || "";
}

export async function publishNow(input: {
  platform: PostPlatform;
  contentPayload: ContentPayload;
}): Promise<void> {
  const userId = await requireUserId();
  const content = summarizeContent(input.platform, input.contentPayload);

  const { error } = await supabase.from("published_posts").insert({
    user_id: userId,
    platform: input.platform,
    content,
    content_payload: input.contentPayload,
    status: "published",
    published_at: new Date().toISOString(),
  });

  if (error) throw new Error(error.message);

  await enqueueNotification("post_published", {
    platform: input.platform,
    content_preview: content.slice(0, 120),
    published_at: new Date().toISOString(),
  });
}

export async function publishMultiple(platforms: PostPlatform[], payload: ContentPayload): Promise<void> {
  for (const platform of platforms) {
    await publishNow({ platform, contentPayload: payload });
  }
}
