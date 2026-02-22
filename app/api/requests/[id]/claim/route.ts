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

  if (existing.creatorId === user.id) {
    return fail("Нельзя брать свою заявку.", 400);
  }
  if (existing.preferredSellerId && existing.preferredSellerId !== user.id && !isAdmin(user)) {
    return fail("Эту заявку может взять только владелец выбранного товара.", 403);
  }
  if (existing.status !== RequestStatus.OPEN) {
    return fail("Заявка уже недоступна.", 409);
  }

  const updateResult = await prisma.purchaseRequest.updateMany({
    where: {
      id: params.id,
      status: RequestStatus.OPEN,
      claimerId: null
    },
    data: {
      status: RequestStatus.CLAIMED,
      claimerId: user.id,
      sellerConfirmedAt: null,
      buyerConfirmedAt: null,
      disputedAt: null,
      disputeComment: null
    }
  });

  if (!updateResult.count) {
    return fail("Другой игрок уже взял заявку.", 409);
  }

  const updated = await prisma.purchaseRequest.findUnique({
    where: { id: params.id },
    include: {
      creator: { select: { username: true } },
      claimer: { select: { username: true } },
      preferredSeller: { select: { username: true } }
    }
  });

  if (!updated) return fail("Заявка не найдена после обновления.", 404);

  return ok({ request: serializePurchaseRequest(updated) });
}
