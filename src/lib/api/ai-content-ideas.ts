import { generateCaption, generateContentIdeas } from "@/lib/ai/gemini";
import { supabase } from "@/lib/supabase";
import type {
  AIContentIdeasRequest,
  AIContentIdeasResponse,
  AICaptionRequest,
  AICaptionResponse,
  AIContentIdeaRecord,
} from "@/lib/types/ai";

async function requireUserId(): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new Error("You must be logged in.");
  return user.id;
}

export async function fetchAIContentIdeas(): Promise<AIContentIdeaRecord[]> {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from("ai_content_ideas")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as AIContentIdeaRecord[];
}

export async function generateAndSaveContentIdeas(
  request: AIContentIdeasRequest
): Promise<AIContentIdeasResponse> {
  const userId = await requireUserId();
  
  // Generate ideas using Gemini
  const response = await generateContentIdeas(request);

  // Save to database
  const { error } = await supabase.from("ai_content_ideas").insert({
    user_id: userId,
    niche: request.niche,
    target_audience: request.targetAudience,
    goal: request.goal,
    generated_content_json: response,
  });

  if (error) throw new Error(error.message);

  return response;
}

export async function generateCaptionForIdea(
  request: AICaptionRequest
): Promise<AICaptionResponse> {
  return generateCaption(request);
}

export async function deleteAIContentIdea(id: string): Promise<void> {
  await requireUserId();
  const { error } = await supabase.from("ai_content_ideas").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
