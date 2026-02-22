import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { User, UserRole } from "@prisma/client";
import { prisma } from "@/lib/db";

const SESSION_TTL_DAYS = 30;
export const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "wind_session";
export const ADMIN_USERNAME = "nertin0";

export function createSessionToken() {
  return randomBytes(32).toString("hex");
}

function buildSessionExpiry() {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_TTL_DAYS);
  return expiresAt;
}

export function roleFromUsername(username: string): UserRole {
  return username.toLowerCase() === ADMIN_USERNAME ? UserRole.ADMIN : UserRole.USER;
}

export async function createSession(userId: string) {
  const token = createSessionToken();
  const expiresAt = buildSessionExpiry();

  await prisma.session.create({
    data: {
      token,
      userId,
      expiresAt
    }
  });

  return { token, expiresAt };
}

export async function deleteSession(token: string) {
  await prisma.session.deleteMany({ where: { token } });
}

export function getSessionTokenFromRequest(request: NextRequest) {
  return request.cookies.get(SESSION_COOKIE_NAME)?.value ?? null;
}

export function setSessionCookie(response: NextResponse, token: string, expiresAt: Date) {
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0)
  });
}

export function isAdmin(user: User | null | undefined) {
  return Boolean(user && user.role === UserRole.ADMIN);
}

export async function getAuthUserByRequest(request: NextRequest) {
  const token = getSessionTokenFromRequest(request);
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true }
  });

  if (!session) return null;

  if (session.expiresAt.getTime() < Date.now()) {
    await prisma.session.delete({ where: { id: session.id } });
    return null;
  }

  if (session.user.isBanned) {
    await prisma.session.deleteMany({ where: { userId: session.user.id } });
    return null;
  }

  return session.user;
}
