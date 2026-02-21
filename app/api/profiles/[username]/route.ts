import { RequestStatus } from "@prisma/client";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { fail, ok } from "@/lib/http";

type Params = { params: { username: string } };

export async function GET(_request: NextRequest, { params }: Params) {
  const username = decodeURIComponent(params.username);

  const user = await prisma.user.findFirst({
    where: {
      username: {
        equals: username,
        mode: "insensitive"
      }
    }
  });
  if (!user) return fail("Profile not found.", 404);

  const [createdOpen, createdTotal, claimedActive, completedAsClaimer] = await Promise.all([
    prisma.purchaseRequest.count({
      where: { creatorId: user.id, status: RequestStatus.OPEN }
    }),
    prisma.purchaseRequest.count({
      where: { creatorId: user.id }
    }),
    prisma.purchaseRequest.count({
      where: { claimerId: user.id, status: RequestStatus.CLAIMED }
    }),
    prisma.purchaseRequest.count({
      where: { claimerId: user.id, status: RequestStatus.COMPLETED }
    })
  ]);

  return ok({
    profile: {
      username: user.username,
      bio: user.bio,
      createdAt: user.createdAt.toISOString(),
      stats: {
        createdOpen,
        createdTotal,
        claimedActive,
        completedAsClaimer
      }
    }
  });
}
