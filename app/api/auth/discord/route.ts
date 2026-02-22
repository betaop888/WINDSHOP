import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { fail } from "@/lib/http";

const OAUTH_STATE_COOKIE = "discord_oauth_state";

function getRedirectUri(request: NextRequest) {
  return process.env.DISCORD_REDIRECT_URI || new URL("/api/auth/discord/callback", request.url).toString();
}

export async function GET(request: NextRequest) {
  const clientId = process.env.DISCORD_CLIENT_ID;
  if (!clientId) {
    return fail("DISCORD_CLIENT_ID не задан.", 500);
  }

  const redirectUri = getRedirectUri(request);
  const state = randomBytes(16).toString("hex");

  const authUrl = new URL("https://discord.com/oauth2/authorize");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("scope", "identify");
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("prompt", "consent");

  const response = NextResponse.redirect(authUrl);
  response.cookies.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10
  });

  return response;
}
