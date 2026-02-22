import { NextRequest } from "next/server";
import { getAuthUserByRequest } from "@/lib/auth-server";
import { ok } from "@/lib/http";

export async function GET(request: NextRequest) {
  const user = await getAuthUserByRequest(request);
  if (!user) {
    return ok({ user: null });
  }

  return ok({
    user: {
      username: user.username,
      displayName: user.displayName,
      bio: user.bio,
      role: user.role
    }
  });
}
