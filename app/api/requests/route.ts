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
      claimer: { select: { username: true } },
      preferredSeller: { select: { username: true } }
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
  if (!user) return fail("Требуется авторизация.", 401);

  try {
    const body = await request.json();
    const itemId = String(body?.itemId ?? "").trim();
    const itemName = String(body?.itemName ?? "").trim();
    const listingId = body?.listingId ? String(body.listingId) : null;
    const quantity = Number(body?.quantity ?? 0);
    const offeredPriceAr = Number(body?.offeredPriceAr ?? 0);

    if (!itemId || !itemName) {
      return fail("itemId и itemName обязательны.", 400);
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return fail("Количество должно быть целым числом больше 0.", 400);
    }
    if (!Number.isInteger(offeredPriceAr) || offeredPriceAr <= 0) {
      return fail("Цена должна быть целым числом больше 0.", 400);
    }

    let preferredSellerId: string | null = null;
    let resolvedItemName = itemName;

    if (listingId) {
      const listing = await prisma.listing.findUnique({
        where: { id: listingId }
      });
      if (!listing || listing.isArchived) {
        return fail("Товар не найден.", 404);
      }
      preferredSellerId = listing.ownerId;
      resolvedItemName = listing.title;
    }

    const created = await prisma.purchaseRequest.create({
      data: {
        itemId,
        itemName: resolvedItemName,
        listingId,
        preferredSellerId,
        quantity,
        offeredPriceAr,
        creatorId: user.id,
        status: RequestStatus.OPEN
      },
      include: {
        creator: { select: { username: true } },
        claimer: { select: { username: true } },
        preferredSeller: { select: { username: true } }
      }
    });

    return ok({ request: serializePurchaseRequest(created) });
  } catch {
    return fail("Ошибка создания заявки.", 500);
  }
}
