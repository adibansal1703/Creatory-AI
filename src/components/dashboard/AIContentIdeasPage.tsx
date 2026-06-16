import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { generateAndSaveContentIdeas, generateCaptionForIdea } from "@/lib/api/ai-content-ideas";
import type { ContentIdea, Goal, GeneratedCaption } from "@/lib/types/ai";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Calendar, Wand2 } from "lucide-react";
import { PUBLISHING_SESSION_KEY, type PublishingSession } from "@/lib/publishing/content-summary";

const GOALS: Goal[] = ["Grow Followers", "Increase Engagement", "Generate Leads", "Sell Product/Service"];

export function AIContentIdeasPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [niche, setNiche] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [goal, setGoal] = useState<Goal>("Grow Followers");
  const [generatedIdeas, setGeneratedIdeas] = useState<ContentIdea[]>([]);
  const [captions, setCaptions] = useState<Record<number, GeneratedCaption>>({});

  const generateIdeasMutation = useMutation({
    mutationFn: async () => {
      if (!niche.trim() || !targetAudience.trim()) {
        throw new Error("Please fill in all fields");
      }
      const response = await generateAndSaveContentIdeas({
        niche: niche.trim(),
        targetAudience: targetAudience.trim(),
        goal,
      });
      return response.ideas;
    },
    onSuccess: (ideas) => {
      setGeneratedIdeas(ideas);
      setCaptions({});
      toast.success("Generated 20 content ideas!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const generateCaptionMutation = useMutation({
    mutationFn: async ({ idea, index }: { idea: ContentIdea; index: number }) => {
      const caption = await generateCaptionForIdea({
        title: idea.title,
        hook: idea.hook,
        type: idea.type,
        niche: niche.trim(),
        targetAudience: targetAudience.trim(),
        goal,
      });
      return { index, caption };
    },
    onSuccess: ({ index, caption }) => {
      setCaptions((prev) => ({ ...prev, [index]: caption }));
      toast.success("Caption generated!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleSchedule = (idea: ContentIdea, index: number) => {
    const caption = captions[index];
    if (!caption) {
      toast.error("Please generate a caption first");
      return;
    }

    const fullCaption = `${caption.caption}\n\n${caption.cta}\n\n${caption.hashtags.map((tag) => `#${tag}`).join(" ")}`;

    const session: PublishingSession = {
      platforms: ["instagram"],
      contentPayload: {
        instagram: {
          content: fullCaption,
          media_url: null,
        },
      },
    };

    sessionStorage.setItem(PUBLISHING_SESSION_KEY, JSON.stringify(session));
    navigate({ to: "/dashboard/scheduler" });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight flex items-center gap-2">
          <Sparkles className="size-8 text-purple-400" />
          AI Content Ideas
        </h1>
        <p className="mt-1 text-muted-foreground">Generate Instagram content ideas with AI</p>
      </div>

      <Card className="glass border-border/60">
        <CardHeader>
          <CardTitle>Generate Ideas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="niche">Niche</Label>
            <Input
              id="niche"
              placeholder="e.g., Fitness, Fashion, Tech"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              className="glass border-border/60"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetAudience">Target Audience</Label>
            <Input
              id="targetAudience"
              placeholder="e.g., Young professionals, Fitness enthusiasts"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="glass border-border/60"
            />
          </div>

          <div className="space-y-2">
            <Label>Goal</Label>
            <Select value={goal} onValueChange={(value) => setGoal(value as Goal)}>
              <SelectTrigger className="glass border-border/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GOALS.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            className="w-full bg-gradient-brand border-0"
            onClick={() => generateIdeasMutation.mutate()}
            disabled={generateIdeasMutation.isPending}
          >
            {generateIdeasMutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" />
                Generating Ideas...
              </>
            ) : (
              <>
                <Wand2 className="size-4 mr-2" />
                Generate Ideas
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedIdeas.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Generated Ideas</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {generatedIdeas.map((idea, index) => (
              <Card key={index} className="glass border-border/60 flex flex-col">
                <CardHeader>
                  <CardTitle className="text-lg">Idea #{index + 1}</CardTitle>
                  <Badge variant="secondary" className="w-fit">
                    {idea.type}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4 flex-1">
                  <div>
                    <Label className="text-sm font-medium">Title</Label>
                    <p className="text-sm mt-1">{idea.title}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Hook</Label>
                    <p className="text-sm mt-1 text-muted-foreground">{idea.hook}</p>
                  </div>

                  {captions[index] && (
                    <div className="space-y-2 pt-2 border-t border-border/60">
                      <Label className="text-sm font-medium">Generated Caption</Label>
                      <div className="text-sm space-y-2 bg-muted/30 p-3 rounded-lg">
                        <p>{captions[index].caption}</p>
                        <p className="font-medium">{captions[index].cta}</p>
                        <p className="text-xs text-muted-foreground">
                          {captions[index].hashtags.map((tag) => `#${tag}`).join(" ")}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 glass"
                      onClick={() =>
                        generateCaptionMutation.mutate({ idea, index })
                      }
                      disabled={generateCaptionMutation.isPending}
                    >
                      {generateCaptionMutation.isPending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Wand2 className="size-4 mr-2" />
                      )}
                      Generate Caption
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-gradient-brand border-0"
                      onClick={() => handleSchedule(idea, index)}
                      disabled={!captions[index]}
                    >
                      <Calendar className="size-4 mr-2" />
                      Schedule
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
