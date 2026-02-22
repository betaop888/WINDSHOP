import { fail } from "@/lib/http";

export async function POST() {
  return fail("Вход доступен только через Discord OAuth.", 405);
}
