export type ContentType =
  | "Educational"
  | "Story"
  | "Opinion"
  | "Tutorial"
  | "Myth Busting"
  | "Case Study";

export type Goal = "Grow Followers" | "Increase Engagement" | "Generate Leads" | "Sell Product/Service";

export interface ContentIdea {
  title: string;
  hook: string;
  type: ContentType;
}

export interface GeneratedCaption {
  caption: string;
  cta: string;
  hashtags: string[];
}

export interface AIContentIdeasRequest {
  niche: string;
  targetAudience: string;
  goal: Goal;
}

export interface AIContentIdeasResponse {
  ideas: ContentIdea[];
}

export interface AICaptionRequest {
  title: string;
  hook: string;
  type: ContentType;
  niche: string;
  targetAudience: string;
  goal: Goal;
}

export interface AICaptionResponse {
  caption: string;
  cta: string;
  hashtags: string[];
}

export interface AIContentIdeaRecord {
  id: string;
  user_id: string;
  niche: string;
  target_audience: string;
  goal: string;
  generated_content_json: AIContentIdeasResponse;
  created_at: string;
}
