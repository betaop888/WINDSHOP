import { NextRequest } from "next/server";
import { getAuthUserByRequest } from "@/lib/auth-server";
import { prisma } from "@/lib/db";
import { fail, ok } from "@/lib/http";

export async function GET(request: NextRequest) {
  const user = await getAuthUserByRequest(request);
  if (!user) return fail("Требуется авторизация.", 401);

  return ok({
    profile: {
      username: user.username,
      displayName: user.displayName,
      bio: user.bio,
      role: user.role,
      isBanned: user.isBanned,
      banReason: user.banReason,
      createdAt: user.createdAt.toISOString()
    }
  });
}

export async function PATCH(request: NextRequest) {
  const user = await getAuthUserByRequest(request);
  if (!user) return fail("Требуется авторизация.", 401);

  try {
    const body = await request.json();
    const bio = String(body?.bio ?? "").trim();
    if (bio.length > 180) {
      return fail("Bio не должно превышать 180 символов.", 400);
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { bio: bio || null }
    });

    return ok({
      profile: {
        username: updated.username,
        displayName: updated.displayName,
        bio: updated.bio,
        role: updated.role,
        isBanned: updated.isBanned,
        banReason: updated.banReason,
        createdAt: updated.createdAt.toISOString()
      }
    });
  } catch {
    return fail("Внутренняя ошибка сервера.", 500);
  }
}
