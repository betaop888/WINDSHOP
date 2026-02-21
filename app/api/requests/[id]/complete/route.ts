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

  if (existing.status !== RequestStatus.CLAIMED) {
    return fail("Only claimed requests can be completed.", 400);
  }

  const permitted = existing.creatorId === user.id || existing.claimerId === user.id;
  if (!permitted) return fail("You cannot complete this request.", 403);

  const updated = await prisma.purchaseRequest.update({
    where: { id: params.id },
    data: {
      status: RequestStatus.COMPLETED
    },
    include: {
      creator: { select: { username: true } },
      claimer: { select: { username: true } }
    }
  });

  return ok({ request: serializePurchaseRequest(updated) });
}
