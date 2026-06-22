import { createClient } from "@supabase/supabase-js";
import { publishScheduledPost } from "./lib/instagram-publish.js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function assertEnv(variable) {
  if (!process.env[variable]) {
    console.error(`Missing required environment variable: ${variable}`);
    process.exit(1);
  }
}

assertEnv("SUPABASE_URL");
assertEnv("SUPABASE_SERVICE_ROLE_KEY");
assertEnv("META_APP_ID");
assertEnv("META_APP_SECRET");
assertEnv("META_GRAPH_VERSION");
assertEnv("API_BASE_URL");

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

async function fetchReadyPosts() {
  const { data, error } = await supabase
    .from("posts_ready_to_publish")
    .select("*")
    .order("scheduled_time", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch ready posts: ${error.message}`);
  }

  console.log("[fetchReadyPosts] Fetched posts:", data?.length ?? 0);
  data?.forEach((post) => {
    console.log("[fetchReadyPosts] Post ID:", post.id, "Platform:", post.platform, "Content payload:", JSON.stringify(post.content_payload, null, 2));
  });

  return data ?? [];
}

async function markPostPublished(postId, externalId) {
  const { error } = await supabase.rpc("mark_post_published", {
    post_id: postId,
    external_id: externalId,
  });

  if (error) {
    throw new Error(`Failed to mark post published: ${error.message}`);
  }
}

async function setSchedulerRunId(postId) {
  const jobId = `scheduler:${new Date().toISOString()}`;
  const { error } = await supabase
    .from("scheduled_posts")
    .update({ scheduler_job_id: jobId })
    .eq("id", postId);

  if (error) {
    console.warn(`Unable to set scheduler job id for post ${postId}: ${error.message}`);
  }
}

async function markPostFailed(postId, message) {
  const payload = {
    status: "failed",
    error_message: message,
    scheduler_job_id: `scheduler:error:${new Date().toISOString()}`,
  };
  const { error } = await supabase.from("scheduled_posts").update(payload).eq("id", postId);
  if (error) {
    console.error(`Failed to mark post ${postId} as failed: ${error.message}`);
  }
}

export async function runScheduler() {
  console.log("Scheduler started: checking for ready posts...");
  const posts = await fetchReadyPosts();

  if (posts.length === 0) {
    console.log("No scheduled posts are ready to publish.");
    return { processed: 0, failures: 0 };
  }

  let failureCount = 0;
  for (const post of posts) {
    console.log(`Processing post ${post.id} for user ${post.user_id} on ${post.platform}...`);

    try {
      await setSchedulerRunId(post.id);
      const externalPostId = await publishScheduledPost(post);
      await markPostPublished(post.id, externalPostId);
      console.log(`Published scheduled post ${post.id} (external id: ${externalPostId}).`);
    } catch (error) {
      failureCount += 1;
      const message = error instanceof Error ? error.message : String(error);
      console.error(`Error publishing scheduled post ${post.id}: ${message}`);
      await markPostFailed(post.id, message);
    }
  }

  if (failureCount > 0) {
    console.error(`${failureCount} scheduled post(s) failed.`);
  } else {
    console.log("All ready scheduled posts processed successfully.");
  }

  return { processed: posts.length, failures: failureCount };
}

const isDirectRun = process.argv[1]?.endsWith("scheduler.js");

if (isDirectRun) {
  runScheduler()
    .then(({ failures }) => {
      if (failures > 0) {
        process.exitCode = 1;
      }
    })
    .catch((error) => {
      console.error(error instanceof Error ? error.message : error);
      process.exit(1);
    });
}
