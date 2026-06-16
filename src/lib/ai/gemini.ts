import { getGeminiApiKey } from "@/lib/env.server";
import type {
  AIContentIdeasRequest,
  AIContentIdeasResponse,
  AICaptionRequest,
  AICaptionResponse,
} from "@/lib/types/ai";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

// Rate limiting: simple in-memory tracker
const requestTimestamps: number[] = [];
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;

function checkRateLimit(): boolean {
  const now = Date.now();
  // Remove timestamps older than the window
  const recentTimestamps = requestTimestamps.filter((t) => now - t < RATE_LIMIT_WINDOW);
  requestTimestamps.length = 0;
  requestTimestamps.push(...recentTimestamps);

  if (requestTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  requestTimestamps.push(now);
  return true;
}

export async function generateContentIdeas(
  request: AIContentIdeasRequest
): Promise<AIContentIdeasResponse> {
  if (!checkRateLimit()) {
    throw new Error("Rate limit exceeded. Please wait a moment before trying again.");
  }

  const apiKey = getGeminiApiKey();
  const prompt = `Generate exactly 20 Instagram content ideas for a creator in the "${request.niche}" niche targeting "${request.targetAudience}" with the goal of "${request.goal}".

For each idea, provide:
- Title: A catchy, engaging title
- Hook: A compelling hook that grabs attention
- Type: One of: Educational, Story, Opinion, Tutorial, Myth Busting, Case Study

Return the response in the following JSON format:
{
  "ideas": [
    {
      "title": "3 Mistakes Beginner Fitness Enthusiasts Make",
      "hook": "Most people waste their first 6 months because of these 3 mistakes.",
      "type": "Educational"
    }
  ]
}

Ensure you generate exactly 20 unique, high-quality ideas. Return ONLY valid JSON, no additional text.`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error("No content generated from Gemini API");
    }

    // Extract JSON from the response (in case there's extra text)
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse JSON from Gemini response");
    }

    const parsedResponse: AIContentIdeasResponse = JSON.parse(jsonMatch[0]);

    if (!parsedResponse.ideas || parsedResponse.ideas.length !== 20) {
      throw new Error("Expected exactly 20 ideas from Gemini API");
    }

    return parsedResponse;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to generate content ideas");
  }
}

export async function generateCaption(request: AICaptionRequest): Promise<AICaptionResponse> {
  if (!checkRateLimit()) {
    throw new Error("Rate limit exceeded. Please wait a moment before trying again.");
  }

  const apiKey = getGeminiApiKey();
  const prompt = `Generate an Instagram caption for the following content idea:

Title: ${request.title}
Hook: ${request.hook}
Type: ${request.type}
Niche: ${request.niche}
Target Audience: ${request.targetAudience}
Goal: ${request.goal}

Generate:
- caption: An engaging Instagram caption (2-4 sentences)
- cta: A clear call-to-action
- hashtags: 10-15 relevant hashtags (comma-separated)

Return the response in the following JSON format:
{
  "caption": "Your engaging caption here...",
  "cta": "Your call-to-action here...",
  "hashtags": ["hashtag1", "hashtag2", ...]
}

Return ONLY valid JSON, no additional text.`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error("No content generated from Gemini API");
    }

    // Extract JSON from the response
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse JSON from Gemini response");
    }

    const parsedResponse: AICaptionResponse = JSON.parse(jsonMatch[0]);

    if (!parsedResponse.caption || !parsedResponse.cta || !parsedResponse.hashtags) {
      throw new Error("Invalid response format from Gemini API");
    }

    return parsedResponse;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to generate caption");
  }
}
