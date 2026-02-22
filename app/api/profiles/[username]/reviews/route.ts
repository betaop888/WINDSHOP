import { NextRequest } from "next/server";
import { getAuthUserByRequest } from "@/lib/auth-server";
import { prisma } from "@/lib/db";
import { fail, ok } from "@/lib/http";
import { serializeReview } from "@/lib/serializers";

type Params = { params: { username: string } };

export async function GET(_request: NextRequest, { params }: Params) {
  const username = decodeURIComponent(params.username);

  const user = await prisma.user.findFirst({
    where: { username: { equals: username, mode: "insensitive" } }
  });
  if (!user) return fail("Пользователь не найден.", 404);

  const reviews = await prisma.review.findMany({
    where: { targetUserId: user.id },
    include: {
      author: {
        select: {
          username: true,
          displayName: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return ok({ reviews: reviews.map(serializeReview) });
}

export async function POST(request: NextRequest, { params }: Params) {
  const authUser = await getAuthUserByRequest(request);
  if (!authUser) return fail("Требуется авторизация.", 401);

  const username = decodeURIComponent(params.username);
  const targetUser = await prisma.user.findFirst({
    where: { username: { equals: username, mode: "insensitive" } }
  });
  if (!targetUser) return fail("Пользователь не найден.", 404);

  if (targetUser.id === authUser.id) {
    return fail("Нельзя оставлять отзыв самому себе.", 400);
  }

  try {
    const body = await request.json();
    const rating = Number(body?.rating ?? 0);
    const comment = String(body?.comment ?? "").trim();

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return fail("Оценка должна быть от 1 до 5.", 400);
    }
    if (comment.length < 3 || comment.length > 300) {
      return fail("Отзыв должен быть от 3 до 300 символов.", 400);
    }

    const review = await prisma.review.upsert({
      where: {
        targetUserId_authorId: {
          targetUserId: targetUser.id,
          authorId: authUser.id
        }
      },
      update: {
        rating,
        comment
      },
      create: {
        targetUserId: targetUser.id,
        authorId: authUser.id,
        rating,
        comment
      },
      include: {
        author: { select: { username: true, displayName: true } }
      }
    });

    return ok({ review: serializeReview(review) });
  } catch {
    return fail("Ошибка сохранения отзыва.", 500);
  }
}
