import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  createSession,
  hashPassword,
  isValidEnglishUsername,
  setSessionCookie
} from "@/lib/auth-server";
import { fail } from "@/lib/http";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const username = String(body?.username ?? "").trim();
    const password = String(body?.password ?? "");
    const repeatPassword = String(body?.repeatPassword ?? "");

    if (!isValidEnglishUsername(username)) {
      return fail(
        "Username must be 3-24 chars and contain only English letters, digits or underscore.",
        400
      );
    }
    if (password.length < 6) {
      return fail("Password must be at least 6 characters.", 400);
    }
    if (password !== repeatPassword) {
      return fail("Passwords do not match.", 400);
    }

    const existing = await prisma.user.findFirst({
      where: { username: { equals: username, mode: "insensitive" } }
    });
    if (existing) {
      return fail("This username is already taken.", 409);
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        username,
        passwordHash
      }
    });

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
