import { getMetaConfig } from "@/lib/meta/config.server";

const INSTAGRAM_SCOPES = [
  "instagram_basic",
  "instagram_content_publish",
  "pages_show_list",
  "pages_read_engagement",
  "pages_manage_metadata",
].join(",");

type TokenResponse = {
  access_token: string;
  token_type?: string;
  expires_in?: number;
};

type InstagramBusinessAccount = {
  id: string;
  username?: string;
};

type FacebookPage = {
  id: string;
  name: string;
  access_token: string;
  instagram_business_account?: InstagramBusinessAccount | null;
};

type InstagramAccountConnection = {
  externalAccountId: string;
  accountName: string;
  pageId: string;
  pageName: string;
  pageAccessToken: string;
  userAccessToken: string;
  tokenExpiresAt: string | null;
};

function graphBaseUrl(graphVersion: string): string {
  return `https://graph.facebook.com/${graphVersion}`;
}

async function parseGraphResponse<T>(response: Response): Promise<T> {
  const body = (await response.json()) as T & { error?: { message?: string; type?: string } };

  if (!response.ok || body.error) {
    throw new Error(body.error?.message ?? `Meta Graph API request failed (${response.status}).`);
  }

  return body;
}

export function buildInstagramAuthorizeUrl(input: { state: string }): string {
  const config = getMetaConfig();
  const params = new URLSearchParams({
    client_id: config.appId,
    redirect_uri: config.redirectUri,
    state: input.state,
    scope: INSTAGRAM_SCOPES,
    response_type: "code",
  });

  return `https://www.facebook.com/${config.graphVersion}/dialog/oauth?${params.toString()}`;
}

export async function exchangeCodeForShortLivedToken(code: string): Promise<TokenResponse> {
  const config = getMetaConfig();
  const params = new URLSearchParams({
    client_id: config.appId,
    client_secret: config.appSecret,
    redirect_uri: config.redirectUri,
    code,
  });

  const response = await fetch(
    `${graphBaseUrl(config.graphVersion)}/oauth/access_token?${params.toString()}`,
  );

  return parseGraphResponse<TokenResponse>(response);
}

export async function exchangeForLongLivedUserToken(
  shortLivedToken: string,
): Promise<TokenResponse> {
  const config = getMetaConfig();
  const params = new URLSearchParams({
    grant_type: "fb_exchange_token",
    client_id: config.appId,
    client_secret: config.appSecret,
    fb_exchange_token: shortLivedToken,
  });

  const response = await fetch(
    `${graphBaseUrl(config.graphVersion)}/oauth/access_token?${params.toString()}`,
  );

  return parseGraphResponse<TokenResponse>(response);
}

export async function fetchInstagramBusinessAccounts(
  userAccessToken: string,
): Promise<InstagramAccountConnection[]> {
  const config = getMetaConfig();
  const params = new URLSearchParams({
    fields: "id,name,access_token,instagram_business_account{id,username}",
    access_token: userAccessToken,
  });

  const response = await fetch(`${graphBaseUrl(config.graphVersion)}/me/accounts?${params.toString()}`);
  const body = await parseGraphResponse<{ data?: FacebookPage[] }>(response);
  const pages = body.data ?? [];

  const connections: InstagramAccountConnection[] = [];

  for (const page of pages) {
    const instagramAccount = page.instagram_business_account;
    if (!instagramAccount?.id) continue;

    const username = instagramAccount.username ?? instagramAccount.id;
    connections.push({
      externalAccountId: instagramAccount.id,
      accountName: username.startsWith("@") ? username : `@${username}`,
      pageId: page.id,
      pageName: page.name,
      pageAccessToken: page.access_token,
      userAccessToken,
      tokenExpiresAt: null,
    });
  }

  return connections;
}

export function tokenExpiresAtFromResponse(token: TokenResponse): string | null {
  if (!token.expires_in) return null;
  return new Date(Date.now() + token.expires_in * 1000).toISOString();
}

export async function validateInstagramAccessToken(input: {
  externalAccountId: string;
  accessToken: string;
}): Promise<{ valid: boolean; username?: string; error?: string }> {
  const config = getMetaConfig();
  const params = new URLSearchParams({
    fields: "id,username",
    access_token: input.accessToken,
  });

  try {
    const response = await fetch(
      `${graphBaseUrl(config.graphVersion)}/${input.externalAccountId}?${params.toString()}`,
    );
    const body = await parseGraphResponse<{ id: string; username?: string }>(response);
    return { valid: true, username: body.username };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Instagram token validation failed.",
    };
  }
}

export async function completeInstagramOAuthFlow(code: string): Promise<InstagramAccountConnection> {
  const shortLived = await exchangeCodeForShortLivedToken(code);
  const longLived = await exchangeForLongLivedUserToken(shortLived.access_token);
  const tokenExpiresAt = tokenExpiresAtFromResponse(longLived);
  const connections = await fetchInstagramBusinessAccounts(longLived.access_token);

  if (connections.length === 0) {
    throw new Error(
      "No Instagram Business account found. Connect an Instagram Business or Creator account to a Facebook Page, then try again.",
    );
  }

  const primary = connections[0];
  return {
    ...primary,
    userAccessToken: longLived.access_token,
    tokenExpiresAt,
  };
}
