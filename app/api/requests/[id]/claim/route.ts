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

  if (existing.creatorId === user.id) {
    return fail("You cannot take your own request.", 400);
  }
  if (existing.status !== RequestStatus.OPEN) {
    return fail("This request is not available.", 409);
  }

  const updateResult = await prisma.purchaseRequest.updateMany({
    where: {
      id: params.id,
      status: RequestStatus.OPEN,
      claimerId: null
    },
    data: {
      status: RequestStatus.CLAIMED,
      claimerId: user.id
    }
  });

  if (!updateResult.count) {
    return fail("Another player already took this request.", 409);
  }

  const updated = await prisma.purchaseRequest.findUnique({
    where: { id: params.id },
    include: {
      creator: { select: { username: true } },
      claimer: { select: { username: true } }
    }
  });

  if (!updated) return fail("Request not found after update.", 404);

  return ok({ request: serializePurchaseRequest(updated) });
}
