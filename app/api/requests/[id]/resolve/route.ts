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
  if (!isAdmin(user)) return fail("Требуются права администратора.", 403);

  const existing = await prisma.purchaseRequest.findUnique({
    where: { id: params.id }
  });
  if (!existing) return fail("Заявка не найдена.", 404);
  if (existing.status !== RequestStatus.DISPUTED) {
    return fail("Решить можно только заявку в статусе спора.", 400);
  }

  const body = await request.json().catch(() => ({}));
  const decision = String((body as { decision?: string }).decision ?? "").trim();

  if (!["complete", "cancel"].includes(decision)) {
    return fail("decision должен быть complete или cancel.", 400);
  }

  const nextStatus = decision === "complete" ? RequestStatus.COMPLETED : RequestStatus.CANCELLED;

  const updated = await prisma.purchaseRequest.update({
    where: { id: params.id },
    data: {
      status: nextStatus,
      buyerConfirmedAt: decision === "complete" ? new Date() : existing.buyerConfirmedAt
    },
    include: {
      creator: { select: { username: true } },
      claimer: { select: { username: true } },
      preferredSeller: { select: { username: true } }
    }
  });

  return ok({ request: serializePurchaseRequest(updated) });
}
