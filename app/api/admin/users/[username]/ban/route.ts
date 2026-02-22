import { NextRequest } from "next/server";
import { ADMIN_USERNAME, getAuthUserByRequest, isAdmin } from "@/lib/auth-server";
import { prisma } from "@/lib/db";
import { fail, ok } from "@/lib/http";

type Params = { params: { username: string } };

export async function POST(request: NextRequest, { params }: Params) {
  const admin = await getAuthUserByRequest(request);
  if (!admin) return fail("Требуется авторизация.", 401);
  if (!isAdmin(admin)) return fail("Требуются права администратора.", 403);

  const username = decodeURIComponent(params.username);
  const target = await prisma.user.findFirst({
    where: { username: { equals: username, mode: "insensitive" } }
  });
  if (!target) return fail("Пользователь не найден.", 404);

  if (target.username.toLowerCase() === ADMIN_USERNAME) {
    return fail("Нельзя банить главного администратора.", 400);
  }

  try {
    const body = await request.json();
    const ban = Boolean(body?.ban);
    const reason = String(body?.reason ?? "").trim();

    const updated = await prisma.user.update({
      where: { id: target.id },
      data: {
        isBanned: ban,
        banReason: ban ? reason || "Нарушение правил маркетплейса." : null,
        bannedAt: ban ? new Date() : null
      }
    });

    if (ban) {
      await prisma.session.deleteMany({ where: { userId: target.id } });
    }

    return ok({
      user: {
        username: updated.username,
        isBanned: updated.isBanned,
        banReason: updated.banReason
      }
    });
  } catch {
    return fail("Ошибка изменения статуса бана.", 500);
  }
}
