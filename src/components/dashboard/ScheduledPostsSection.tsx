import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { AlertCircle, CalendarPlus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { EditPostDialog } from "@/components/dashboard/EditPostDialog";
import { PlatformBadge } from "@/components/dashboard/PlatformBadge";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeleteScheduledPost, useScheduledPosts } from "@/hooks/use-scheduled-posts";
import { formatScheduledDateTime } from "@/lib/scheduled-post-utils";
import type { ScheduledPost } from "@/lib/types/database";

type ScheduledPostsSectionProps = {
  variant?: "page" | "embedded";
};

function PostCardSkeleton() {
  return (
    <div className="glass rounded-2xl p-5 space-y-3">
      <Skeleton className="h-5 w-24" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}

export function ScheduledPostsSection({ variant = "page" }: ScheduledPostsSectionProps) {
  const { data: posts, isLoading, isError, error, refetch } = useScheduledPosts();
  const deletePost = useDeleteScheduledPost();
  const [editingPost, setEditingPost] = useState<ScheduledPost | null>(null);
  const [deletingPost, setDeletingPost] = useState<ScheduledPost | null>(null);

  const handleDelete = async () => {
    if (!deletingPost) return;
    try {
      await deletePost.mutateAsync(deletingPost.id);
      toast.success("Post deleted");
      setDeletingPost(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete post");
    }
  };

  return (
    <section>
      {variant === "page" && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Scheduled Posts</h1>
            <p className="mt-1 text-muted-foreground">
              Manage and reschedule your upcoming social content.
            </p>
          </div>
          <Button className="bg-gradient-brand border-0 hover:opacity-90 shrink-0" asChild>
            <Link to="/dashboard/publishing">
              <CalendarPlus className="size-4" />
              Create post
            </Link>
          </Button>
        </div>
      )}

      {variant === "embedded" && (
        <h2 className="text-lg font-semibold mb-4">Your scheduled posts</h2>
      )}

      <div className={variant === "page" ? "mt-8" : ""}>
        {isLoading && (
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <PostCardSkeleton key={i} />
            ))}
          </div>
        )}

        {isError && (
          <div className="glass rounded-2xl p-8 text-center border border-destructive/30">
            <AlertCircle className="mx-auto size-10 text-destructive" />
            <p className="mt-3 font-medium">Could not load scheduled posts</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {error instanceof Error ? error.message : "Something went wrong"}
            </p>
            <Button variant="outline" className="mt-4 glass" onClick={() => refetch()}>
              Try again
            </Button>
          </div>
        )}

        {!isLoading && !isError && posts?.length === 0 && (
          <EmptyState
            icon={<CalendarPlus className="size-8" />}
            title="No scheduled posts yet"
            description="Create content in Multi-Platform Publishing, then choose Schedule Post to add it here."
            action={{ label: "Create and schedule a post", to: "/dashboard/publishing" }}
          />
        )}

        {!isLoading && !isError && posts && posts.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {posts.map((post) => (
              <article
                key={post.id}
                className="glass rounded-2xl p-5 flex flex-col gap-4 hover:border-primary/30 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <PlatformBadge platform={post.platform} />
                  <StatusBadge status={post.status} />
                </div>
                <p className="text-sm text-foreground/90 line-clamp-3 leading-relaxed">
                  {post.content}
                </p>
                <p className="text-xs text-muted-foreground">
                  Scheduled for{" "}
                  <span className="text-foreground font-medium">
                    {formatScheduledDateTime(post.scheduled_time)}
                  </span>
                  {post.timezone ? ` (${post.timezone})` : null}
                </p>
                <div className="flex flex-wrap gap-2 pt-1 mt-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    className="glass"
                    onClick={() => setEditingPost(post)}
                  >
                    <Pencil className="size-3.5" />
                    Edit / Reschedule
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="glass text-destructive hover:text-destructive"
                    onClick={() => setDeletingPost(post)}
                  >
                    <Trash2 className="size-3.5" />
                    Delete
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <EditPostDialog
        post={editingPost}
        open={Boolean(editingPost)}
        onOpenChange={(open) => !open && setEditingPost(null)}
      />

      <AlertDialog open={Boolean(deletingPost)} onOpenChange={(open) => !open && setDeletingPost(null)}>
        <AlertDialogContent className="glass border-border/60">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete scheduled post?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The post will be removed from your schedule.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="glass">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
              disabled={deletePost.isPending}
            >
              {deletePost.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
