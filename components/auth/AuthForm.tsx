"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MessageCircle, ShieldCheck } from "lucide-react";
import { useAppState } from "@/components/providers/AppStateProvider";

const errorMessages: Record<string, string> = {
  banned: "Ваш аккаунт заблокирован администратором.",
  discord_env_missing: "Discord OAuth не настроен на сервере.",
  discord_state_invalid: "Ошибка безопасности OAuth. Повторите вход.",
  discord_token_failed: "Не удалось получить токен Discord.",
  discord_token_invalid: "Discord вернул некорректный токен.",
  discord_profile_failed: "Не удалось получить профиль Discord.",
  discord_profile_invalid: "Discord вернул неполные данные профиля."
};

export function AuthForm() {
  const { startDiscordAuth } = useAppState();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <section className="mx-auto w-full max-w-md rounded-2xl border border-line bg-panel/95 p-6 shadow-card">
      <div className="mb-4">
        <h1 className="font-display text-2xl">Вход через Discord</h1>
        <p className="mt-1 text-sm text-muted">
          Регистрация и авторизация доступны только через Discord. Ник на сайте совпадает с ником в Discord.
        </p>
      </div>

      <button
        type="button"
        onClick={startDiscordAuth}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-accent/40 bg-gradient-to-b from-accent to-accentStrong px-4 py-2.5 text-sm font-bold text-white transition hover:from-[#a6c6ff] hover:to-[#5f8ef5]"
      >
        <MessageCircle size={16} />
        Войти через Discord
      </button>

      <div className="mt-4 rounded-lg border border-line/80 bg-[#070b12] px-3 py-2 text-xs text-muted">
        <p className="inline-flex items-center gap-1 text-slate-200">
          <ShieldCheck size={14} className="text-emerald-300" />
          Безопасный вход OAuth2
        </p>
        <p className="mt-1">После входа вы сможете создавать товары, брать заявки и оставлять отзывы.</p>
      </div>

      {error ? (
        <div className="mt-3 rounded-lg border border-rose-300/30 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">
          {errorMessages[error] || "Неизвестная ошибка входа."}
        </div>
      ) : null}

      <p className="mt-4 text-sm text-muted">
        На главную: <Link href="/" className="font-semibold text-accent hover:underline">открыть маркет</Link>
      </p>
    </section>
  );
}
