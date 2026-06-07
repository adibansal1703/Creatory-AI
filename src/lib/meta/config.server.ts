import process from "node:process";

export type MetaConfig = {
  appId: string;
  appSecret: string;
  redirectUri: string;
  graphVersion: string;
};

export function getMetaConfig(): MetaConfig {
  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  const redirectUri =
    process.env.META_REDIRECT_URI ??
    `${process.env.APP_URL ?? "http://localhost:5173"}/auth/instagram/callback`;
  const graphVersion = process.env.META_GRAPH_VERSION ?? "v21.0";

  if (!appId || !appSecret) {
    throw new Error(
      "Instagram OAuth is not configured. Set META_APP_ID and META_APP_SECRET on the server.",
    );
  }

  return { appId, appSecret, redirectUri, graphVersion };
}

export function getOAuthStateSecret(): string {
  return process.env.OAUTH_STATE_SECRET ?? process.env.META_APP_SECRET ?? "";
}
