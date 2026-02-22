import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import {
  ADMIN_USERNAME,
  clearSessionCookie,
  createSession,
  setSessionCookie
} from "@/lib/auth-server";
import { prisma } from "@/lib/db";

const OAUTH_STATE_COOKIE = "discord_oauth_state";

type DiscordTokenResponse = {
  access_token: string;
  token_type: string;
};

type DiscordUserResponse = {
  id: string;
  username: string;
  global_name: string | null;
  avatar: string | null;
};

function getRedirectUri(request: NextRequest) {
  return process.env.DISCORD_REDIRECT_URI || new URL("/api/auth/discord/callback", request.url).toString();
}

async function resolveUniqueUsername(baseUsername: string, currentUserId?: string) {
  let candidate = baseUsername;
  let counter = 0;

  while (true) {
    const existing = await prisma.user.findFirst({
      where: {
        username: { equals: candidate, mode: "insensitive" },
        ...(currentUserId ? { NOT: { id: currentUserId } } : {})
      }
    });

    if (!existing) {
      return candidate;
    }

    counter += 1;
    candidate = `${baseUsername}_${counter}`;
  }
}

function redirectWithError(request: NextRequest, code: string) {
  const url = new URL("/login", request.url);
  url.searchParams.set("error", code);
  return NextResponse.redirect(url);
}

function clearStateCookie(response: NextResponse) {
  response.cookies.set(OAUTH_STATE_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0)
  });
}

export async function GET(request: NextRequest) {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return redirectWithError(request, "discord_env_missing");
  }

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const stateCookie = request.cookies.get(OAUTH_STATE_COOKIE)?.value;

  if (!code || !state || !stateCookie || state !== stateCookie) {
    return redirectWithError(request, "discord_state_invalid");
  }

  const redirectUri = getRedirectUri(request);

  const tokenBody = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri
  });

  const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: tokenBody.toString(),
    cache: "no-store"
  });

  if (!tokenResponse.ok) {
    return redirectWithError(request, "discord_token_failed");
  }

  const tokenJson = (await tokenResponse.json()) as DiscordTokenResponse;
  if (!tokenJson.access_token) {
    return redirectWithError(request, "discord_token_invalid");
  }

  const profileResponse = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${tokenJson.access_token}` },
    cache: "no-store"
  });

  if (!profileResponse.ok) {
    return redirectWithError(request, "discord_profile_failed");
  }

  const discordUser = (await profileResponse.json()) as DiscordUserResponse;
  if (!discordUser.id || !discordUser.username) {
    return redirectWithError(request, "discord_profile_invalid");
  }

  const existingByDiscordId = await prisma.user.findUnique({
    where: { discordId: discordUser.id }
  });

  const desiredUsername = discordUser.username;
  const safeUsername = await resolveUniqueUsername(desiredUsername, existingByDiscordId?.id);

  const role =
    desiredUsername.toLowerCase() === ADMIN_USERNAME ? UserRole.ADMIN : UserRole.USER;

  const upserted = await prisma.user.upsert({
    where: { discordId: discordUser.id },
    update: {
      username: safeUsername,
      displayName: discordUser.global_name || safeUsername,
      discordAvatar: discordUser.avatar,
      role
    },
    create: {
      username: safeUsername,
      displayName: discordUser.global_name || safeUsername,
      discordId: discordUser.id,
      discordAvatar: discordUser.avatar,
      role
    }
  });

  if (upserted.isBanned) {
    const bannedResponse = redirectWithError(request, "banned");
    clearSessionCookie(bannedResponse);
    clearStateCookie(bannedResponse);
    return bannedResponse;
  }

  const { token, expiresAt } = await createSession(upserted.id);
  const successResponse = NextResponse.redirect(new URL("/", request.url));
  setSessionCookie(successResponse, token, expiresAt);
  clearStateCookie(successResponse);

  return successResponse;
}
