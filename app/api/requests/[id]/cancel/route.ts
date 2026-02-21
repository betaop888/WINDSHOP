import { RequestStatus } from "@prisma/client";
import { NextRequest } from "next/server";
import { getAuthUserByRequest } from "@/lib/auth-server";
import { prisma } from "@/lib/db";
import { fail, ok } from "@/lib/http";
import { serializePurchaseRequest } from "@/lib/serializers";

type Params = { params: { id: string } };

export async function POST(request: NextRequest, { params }: Params) {
  const user = await getAuthUserByRequest(request);
  if (!user) return fail("Unauthorized.", 401);

  const existing = await prisma.purchaseRequest.findUnique({
    where: { id: params.id }
  });
  if (!existing) return fail("Request not found.", 404);

  if (existing.creatorId !== user.id) {
    return fail("Only the creator can cancel this request.", 403);
  }
  if (existing.status !== RequestStatus.OPEN) {
    return fail("Only open requests can be cancelled.", 400);
  }

  const updated = await prisma.purchaseRequest.update({
    where: { id: params.id },
    data: {
      status: RequestStatus.CANCELLED
    },
    include: {
      creator: { select: { username: true } },
      claimer: { select: { username: true } }
    }
  });

  return ok({ request: serializePurchaseRequest(updated) });
}
