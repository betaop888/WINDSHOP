import { NextRequest } from "next/server";
import { getAuthUserByRequest } from "@/lib/auth-server";
import { prisma } from "@/lib/db";
import { fail, ok } from "@/lib/http";

export async function GET(request: NextRequest) {
  const user = await getAuthUserByRequest(request);
  if (!user) return fail("Unauthorized.", 401);

  return ok({
    profile: {
      username: user.username,
      bio: user.bio,
      createdAt: user.createdAt.toISOString()
    }
  });
}

export async function PATCH(request: NextRequest) {
  const user = await getAuthUserByRequest(request);
  if (!user) return fail("Unauthorized.", 401);

  try {
    const body = await request.json();
    const bio = String(body?.bio ?? "").trim();
    if (bio.length > 180) {
      return fail("Bio must be 180 characters or less.", 400);
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { bio: bio || null }
    });

    return ok({
      profile: {
        username: updated.username,
        bio: updated.bio,
        createdAt: updated.createdAt.toISOString()
      }
    });
  } catch {
    return fail("Unexpected server error.", 500);
  }
}
