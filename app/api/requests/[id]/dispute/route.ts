import { RequestStatus } from "@prisma/client";
import { NextRequest } from "next/server";
import { getAuthUserByRequest, isAdmin } from "@/lib/auth-server";
import { prisma } from "@/lib/db";
import { fail, ok } from "@/lib/http";
import { serializePurchaseRequest } from "@/lib/serializers";

type Params = { params: { id: string } };

export async function POST(request: NextRequest, { params }: Params) {
  const user = await getAuthUserByRequest(request);
  if (!user) return fail("Требуется авторизация.", 401);

  const existing = await prisma.purchaseRequest.findUnique({
    where: { id: params.id }
  });
  if (!existing) return fail("Заявка не найдена.", 404);

  if (
    existing.status !== RequestStatus.CLAIMED &&
    existing.status !== RequestStatus.AWAITING_BUYER_CONFIRM
  ) {
    return fail("Спор можно открыть только по активной сделке.", 400);
  }

  const permitted =
    existing.creatorId === user.id || existing.claimerId === user.id || isAdmin(user);
  if (!permitted) {
    return fail("Недостаточно прав для открытия спора.", 403);
  }

  const body = await request.json().catch(() => ({}));
  const reason = String((body as { reason?: string }).reason ?? "").trim();
  if (reason.length < 3 || reason.length > 280) {
    return fail("Причина спора: от 3 до 280 символов.", 400);
  }

  const updated = await prisma.purchaseRequest.update({
    where: { id: params.id },
    data: {
      status: RequestStatus.DISPUTED,
      disputedAt: new Date(),
      disputeComment: reason
    },
    include: {
      creator: { select: { username: true } },
      claimer: { select: { username: true } },
      preferredSeller: { select: { username: true } }
    }
  });

  return ok({ request: serializePurchaseRequest(updated) });
}
