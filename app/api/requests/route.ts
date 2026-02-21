import { RequestStatus } from "@prisma/client";
import { NextRequest } from "next/server";
import { getAuthUserByRequest } from "@/lib/auth-server";
import { prisma } from "@/lib/db";
import { fail, ok } from "@/lib/http";
import { serializePurchaseRequest } from "@/lib/serializers";

function statusFilter(value: string | null) {
  if (value === "all") return undefined;
  return { in: [RequestStatus.OPEN, RequestStatus.CLAIMED] };
}

export async function GET(request: NextRequest) {
  const statusParam = request.nextUrl.searchParams.get("status");

  const list = await prisma.purchaseRequest.findMany({
    where: {
      status: statusFilter(statusParam)
    },
    include: {
      creator: { select: { username: true } },
      claimer: { select: { username: true } }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return ok({
    requests: list.map(serializePurchaseRequest)
  });
}

export async function POST(request: NextRequest) {
  const user = await getAuthUserByRequest(request);
  if (!user) return fail("Unauthorized.", 401);

  try {
    const body = await request.json();
    const itemId = String(body?.itemId ?? "").trim();
    const itemName = String(body?.itemName ?? "").trim();
    const quantity = Number(body?.quantity ?? 0);
    const offeredPriceAr = Number(body?.offeredPriceAr ?? 0);

    if (!itemId || !itemName) {
      return fail("itemId and itemName are required.", 400);
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return fail("Quantity must be a positive integer.", 400);
    }
    if (!Number.isInteger(offeredPriceAr) || offeredPriceAr <= 0) {
      return fail("Offered price must be a positive integer.", 400);
    }

    const created = await prisma.purchaseRequest.create({
      data: {
        itemId,
        itemName,
        quantity,
        offeredPriceAr,
        creatorId: user.id,
        status: RequestStatus.OPEN
      },
      include: {
        creator: { select: { username: true } },
        claimer: { select: { username: true } }
      }
    });

    return ok({ request: serializePurchaseRequest(created) });
  } catch {
    return fail("Unexpected server error.", 500);
  }
}
