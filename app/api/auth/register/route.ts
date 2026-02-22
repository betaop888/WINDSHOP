import { fail } from "@/lib/http";

export async function POST() {
  return fail("Регистрация доступна только через Discord OAuth.", 405);
}
