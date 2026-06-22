import { enqueueNotification } from "@/lib/api/notifications";
import { supabase } from "@/lib/supabase";
import { summarizeContent } from "@/lib/api/published-posts";
import type { ContentPayload, PostPlatform, ScheduledPost } from "@/lib/types/database";

async function requireUserId(): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new Error("You must be logged in.");
  return user.id;
}

export async function fetchScheduledPosts(): Promise<ScheduledPost[]> {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from("scheduled_posts")
    .select("*")
    .eq("user_id", userId)
    .order("scheduled_time", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as ScheduledPost[];
}

export async function createScheduledPost(input: {
  platform: PostPlatform;
  content: string;
  scheduled_time: string;
  timezone?: string;
  content_payload?: ContentPayload;
}): Promise<ScheduledPost> {
  return schedulePost({
    platform: input.platform,
    contentPayload: input.content_payload ?? { [input.platform]: { content: input.content } },
    scheduledTime: input.scheduled_time,
    timezone: input.timezone ?? "UTC",
  });
}

export async function schedulePost(input: {
  platform: PostPlatform;
  contentPayload: ContentPayload;
  scheduledTime: string;
  timezone: string;
}): Promise<ScheduledPost> {
  console.log("[schedulePost] Called with:", input);
  console.log("[schedulePost] contentPayload:", JSON.stringify(input.contentPayload, null, 2));
  const userId = await requireUserId();
  console.log("[schedulePost] User ID:", userId);
  const content = summarizeContent(input.platform, input.contentPayload);
  console.log("[schedulePost] Summarized content:", content);

  const insertData = {
    user_id: userId,
    platform: input.platform,
    content,
    content_payload: input.contentPayload,
    scheduled_time: input.scheduledTime,
    timezone: input.timezone,
    status: "scheduled",
  };
  console.log("[schedulePost] Inserting into scheduled_posts:", insertData);

  const { data, error } = await supabase
    .from("scheduled_posts")
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error("[schedulePost] Database insert error:", error);
    throw new Error(error.message);
  }

  console.log("[schedulePost] Insert successful:", data);
  console.log("[schedulePost] Saved content_payload:", JSON.stringify(data.content_payload, null, 2));

  await enqueueNotification("post_scheduled", {
    platform: input.platform,
    content_preview: content.slice(0, 120),
    scheduled_time: input.scheduledTime,
    timezone: input.timezone,
  });

  return data as ScheduledPost;
}

export async function scheduleMultiple(input: {
  platforms: PostPlatform[];
  contentPayload: ContentPayload;
  scheduledTime: string;
  timezone: string;
}): Promise<ScheduledPost[]> {
  console.log("[scheduleMultiple] Called with:", input);
  const results: ScheduledPost[] = [];
  for (const platform of input.platforms) {
    console.log(`[scheduleMultiple] Scheduling for platform: ${platform}`);
    results.push(
      await schedulePost({
        platform,
        contentPayload: input.contentPayload,
        scheduledTime: input.scheduledTime,
        timezone: input.timezone,
      }),
    );
  }
  console.log("[scheduleMultiple] All platforms scheduled successfully:", results);
  return results;
}

export async function updateScheduledPost(
  id: string,
  input: {
    platform?: PostPlatform;
    contentPayload?: ContentPayload;
    scheduledTime?: string;
    timezone?: string;
    status?: ScheduledPost["status"];
  },
): Promise<ScheduledPost> {
  await requireUserId();

  const payload: Record<string, unknown> = {};
  if (input.platform) payload.platform = input.platform;
  if (input.contentPayload) {
    payload.content_payload = input.contentPayload;
    payload.content = summarizeContent(
      input.platform ?? (input.contentPayload && Object.keys(input.contentPayload)[0] as PostPlatform),
      input.contentPayload,
    );
  }
  if (input.scheduledTime) payload.scheduled_time = input.scheduledTime;
  if (input.timezone) payload.timezone = input.timezone;
  if (input.status) payload.status = input.status;

  const { data, error } = await supabase
    .from("scheduled_posts")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as ScheduledPost;
}

export async function deleteScheduledPost(id: string): Promise<void> {
  await requireUserId();
  const { error } = await supabase.from("scheduled_posts").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
