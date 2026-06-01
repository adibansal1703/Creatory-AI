import type { ContentPayload, PostPlatform } from "@/lib/types/database";

export function buildContentPayload(
  platforms: PostPlatform[],
  fields: Record<string, string>,
): ContentPayload {
  const payload: ContentPayload = {};

  for (const platform of platforms) {
    switch (platform) {
      case "instagram":
        payload.instagram = {
          caption: fields[`${platform}_caption`] ?? "",
          hashtags: fields[`${platform}_hashtags`] ?? "",
          media_url: fields[`${platform}_media`] ?? null,
        };
        break;
      case "youtube":
        payload.youtube = {
          title: fields[`${platform}_title`] ?? "",
          description: fields[`${platform}_description`] ?? "",
          tags: fields[`${platform}_tags`] ?? "",
          media_url: fields[`${platform}_media`] ?? null,
        };
        break;
      default:
        payload[platform] = {
          content: fields[`${platform}_content`] ?? "",
          media_url: fields[`${platform}_media`] ?? null,
        };
        break;
    }
  }

  return payload;
}

export const PUBLISHING_SESSION_KEY = "nexora_publishing_draft";

export type PublishingSession = {
  platforms: PostPlatform[];
  contentPayload: ContentPayload;
};
