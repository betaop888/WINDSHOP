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

  if (existing.status !== RequestStatus.AWAITING_BUYER_CONFIRM) {
    return fail("Подтвердить можно только этап после сдачи товара продавцом.", 400);
  }

  const permitted = existing.creatorId === user.id || isAdmin(user);
  if (!permitted) {
    return fail("Только покупатель может подтвердить получение.", 403);
  }

  const updated = await prisma.purchaseRequest.update({
    where: { id: params.id },
    data: {
      status: RequestStatus.COMPLETED,
      buyerConfirmedAt: new Date()
    },
    include: {
      creator: { select: { username: true } },
      claimer: { select: { username: true } },
      preferredSeller: { select: { username: true } }
    }
  });

  return ok({ request: serializePurchaseRequest(updated) });
}
