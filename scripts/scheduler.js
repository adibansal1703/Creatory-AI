import { createClient } from "@supabase/supabase-js";

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

  return data ?? [];
}

async function markPostPublished(postId) {
  const { error } = await supabase.rpc("mark_post_published", {
    post_id: postId,
    external_id: null,
  });

  if (error) {
    throw new Error(`Failed to mark post published: ${error.message}`);
  }
}

async function setSchedulerRunId(postId) {
  const jobId = `scheduler:${new Date().toISOString()}`;
  const { error } = await supabase
    .from("scheduled_posts")
    .update({ n8n_job_id: jobId })
    .eq("id", postId);

  if (error) {
    console.warn(`Unable to set scheduler job id for post ${postId}: ${error.message}`);
  }
}

async function markPostFailed(postId, message) {
  const payload = {
    status: "failed",
    error_message: message,
    n8n_job_id: `scheduler:error:${new Date().toISOString()}`,
  };
  const { error } = await supabase.from("scheduled_posts").update(payload).eq("id", postId);
  if (error) {
    console.error(`Failed to mark post ${postId} as failed: ${error.message}`);
  }
}

async function run() {
  console.log("Scheduler started: checking for ready posts...");
  const posts = await fetchReadyPosts();

  if (posts.length === 0) {
    console.log("No scheduled posts are ready to publish.");
    return;
  }

  let failureCount = 0;
  for (const post of posts) {
    console.log(`Processing post ${post.id} for user ${post.user_id} on ${post.platform}...`);

    try {
      await setSchedulerRunId(post.id);
      await markPostPublished(post.id);
      console.log(`Published scheduled post ${post.id}.`);
    } catch (error) {
      failureCount += 1;
      const message = error instanceof Error ? error.message : String(error);
      console.error(`Error publishing scheduled post ${post.id}: ${message}`);
      await markPostFailed(post.id, message);
    }
  }

  if (failureCount > 0) {
    console.error(`${failureCount} scheduled post(s) failed.`);
    process.exitCode = 1;
  } else {
    console.log("All ready scheduled posts processed successfully.");
  }
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
