import { NextRequest } from "next/server";
import { getAuthUserByRequest } from "@/lib/auth-server";
import { prisma } from "@/lib/db";
import { fail, ok } from "@/lib/http";
import { serializeListing } from "@/lib/serializers";

function validateImageUrl(value: string) {
  if (value.startsWith("data:image/")) return true;
  return /^https?:\/\//i.test(value);
}

export async function GET() {
  const listings = await prisma.listing.findMany({
    where: { isArchived: false },
    include: {
      owner: { select: { username: true, displayName: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  return ok({
    listings: listings.map(serializeListing)
  });
}

export async function POST(request: NextRequest) {
  const user = await getAuthUserByRequest(request);
  if (!user) return fail("Требуется авторизация.", 401);

  try {
    const body = await request.json();
    const title = String(body?.title ?? "").trim();
    const description = String(body?.description ?? "").trim();
    const category = String(body?.category ?? "Пользовательские товары").trim();
    const imageUrl = String(body?.imageUrl ?? "").trim();
    const priceAr = Number(body?.priceAr ?? 0);

    if (title.length < 2 || title.length > 80) {
      return fail("Название: от 2 до 80 символов.", 400);
    }
    if (description.length < 5 || description.length > 500) {
      return fail("Описание: от 5 до 500 символов.", 400);
    }
    if (category.length < 2 || category.length > 40) {
      return fail("Категория: от 2 до 40 символов.", 400);
    }
    if (!validateImageUrl(imageUrl) || imageUrl.length > 500000) {
      return fail("Картинка должна быть URL или data:image/*", 400);
    }
    if (!Number.isInteger(priceAr) || priceAr <= 0 || priceAr > 1000000) {
      return fail("Цена должна быть целым числом от 1 до 1000000.", 400);
    }

    const created = await prisma.listing.create({
      data: {
        title,
        description,
        category,
        imageUrl,
        priceAr,
        ownerId: user.id
      },
      include: {
        owner: { select: { username: true, displayName: true } }
      }
    });

    return ok({ listing: serializeListing(created) });
  } catch {
    return fail("Ошибка создания товара.", 500);
  }
}
