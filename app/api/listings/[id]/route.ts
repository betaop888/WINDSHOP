import { NextRequest } from "next/server";
import { isAdmin, getAuthUserByRequest } from "@/lib/auth-server";
import { prisma } from "@/lib/db";
import { fail, ok } from "@/lib/http";
import { serializeListing } from "@/lib/serializers";

function validateImageUrl(value: string) {
  if (value.startsWith("data:image/")) return true;
  return /^https?:\/\//i.test(value);
}

type Params = { params: { id: string } };

export async function PATCH(request: NextRequest, { params }: Params) {
  const user = await getAuthUserByRequest(request);
  if (!user) return fail("Требуется авторизация.", 401);

  const listing = await prisma.listing.findUnique({
    where: { id: params.id }
  });
  if (!listing) return fail("Товар не найден.", 404);

  const canEdit = listing.ownerId === user.id || isAdmin(user);
  if (!canEdit) return fail("Недостаточно прав.", 403);

  try {
    const body = await request.json();
    const title = String(body?.title ?? listing.title).trim();
    const description = String(body?.description ?? listing.description).trim();
    const category = String(body?.category ?? listing.category).trim();
    const imageUrl = String(body?.imageUrl ?? listing.imageUrl).trim();
    const priceAr = Number(body?.priceAr ?? listing.priceAr);

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

    const updated = await prisma.listing.update({
      where: { id: params.id },
      data: {
        title,
        description,
        category,
        imageUrl,
        priceAr
      },
      include: {
        owner: { select: { username: true, displayName: true } }
      }
    });

    return ok({ listing: serializeListing(updated) });
  } catch {
    return fail("Ошибка обновления товара.", 500);
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const user = await getAuthUserByRequest(request);
  if (!user) return fail("Требуется авторизация.", 401);

  const listing = await prisma.listing.findUnique({
    where: { id: params.id }
  });
  if (!listing) return fail("Товар не найден.", 404);

  const canDelete = listing.ownerId === user.id || isAdmin(user);
  if (!canDelete) return fail("Недостаточно прав.", 403);

  await prisma.listing.update({
    where: { id: params.id },
    data: { isArchived: true }
  });

  return ok({ ok: true });
}
