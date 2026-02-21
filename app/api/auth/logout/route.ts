import { NextRequest, NextResponse } from "next/server";
import {
  clearSessionCookie,
  deleteSession,
  getSessionTokenFromRequest
} from "@/lib/auth-server";

export async function POST(request: NextRequest) {
  const token = getSessionTokenFromRequest(request);
  if (token) {
    await deleteSession(token);
  }

  const response = NextResponse.json({ ok: true });
  clearSessionCookie(response);
  return response;
}
