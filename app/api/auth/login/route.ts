import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  createSession,
  setSessionCookie,
  verifyPassword
} from "@/lib/auth-server";
import { fail } from "@/lib/http";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const username = String(body?.username ?? "").trim();
    const password = String(body?.password ?? "");

    if (!username || !password) {
      return fail("Username and password are required.", 400);
    }

    const user = await prisma.user.findFirst({
      where: { username: { equals: username, mode: "insensitive" } }
    });

    if (!user) {
      return fail("Invalid username or password.", 401);
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return fail("Invalid username or password.", 401);
    }

    const { token, expiresAt } = await createSession(user.id);
    const response = NextResponse.json({
      user: {
        username: user.username,
        bio: user.bio
      }
    });
    setSessionCookie(response, token, expiresAt);
    return response;
  } catch {
    return fail("Unexpected server error.", 500);
  }
}
