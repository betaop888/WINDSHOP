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

  if (existing.status !== RequestStatus.CLAIMED) {
    return fail("Вернуть можно только заявку в работе.", 400);
  }
  if (existing.claimerId !== user.id && !isAdmin(user)) {
    return fail("Только исполнитель может вернуть заявку.", 403);
  }

  const updated = await prisma.purchaseRequest.update({
    where: { id: params.id },
    data: {
      status: RequestStatus.OPEN,
      claimerId: null
    },
    include: {
      creator: { select: { username: true } },
      claimer: { select: { username: true } },
      preferredSeller: { select: { username: true } }
    }
  });

  return ok({ request: serializePurchaseRequest(updated) });
}
