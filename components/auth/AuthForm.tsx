"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useAppState } from "@/components/providers/AppStateProvider";

type AuthMode = "login" | "register";

type AuthFormProps = {
  mode: AuthMode;
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const { login, register } = useAppState();
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const isLogin = mode === "login";

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = isLogin
      ? login(nickname, password)
      : register(nickname, password, repeatPassword);

    setMessage(result.message);
    if (!result.ok) return;

    router.push("/");
  }

  return (
    <section className="mx-auto w-full max-w-md rounded-2xl border border-line bg-panel/95 p-5 shadow-card">
      <h1 className="font-display text-xl">{isLogin ? "Вход" : "Регистрация"}</h1>
      <p className="mt-1 text-sm text-muted">
        {isLogin
          ? "Вход по нику и паролю."
          : "Создайте аккаунт, чтобы покупать предметы и оставлять заявки."}
      </p>

      <form className="mt-4 space-y-3" onSubmit={onSubmit}>
        <label className="block text-sm text-muted">
          Ник
          <input
            type="text"
            value={nickname}
            minLength={3}
            maxLength={24}
            onChange={(event) => setNickname(event.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-line bg-[#070b11] px-3 py-2 text-slate-100 outline-none focus:border-slate-500"
          />
        </label>

        <label className="block text-sm text-muted">
          Пароль
          <input
            type="password"
            value={password}
            minLength={4}
            maxLength={40}
            onChange={(event) => setPassword(event.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-line bg-[#070b11] px-3 py-2 text-slate-100 outline-none focus:border-slate-500"
          />
        </label>

        {!isLogin ? (
          <label className="block text-sm text-muted">
            Повторите пароль
            <input
              type="password"
              value={repeatPassword}
              minLength={4}
              maxLength={40}
              onChange={(event) => setRepeatPassword(event.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-line bg-[#070b11] px-3 py-2 text-slate-100 outline-none focus:border-slate-500"
            />
          </label>
        ) : null}

        <button
          type="submit"
          className="inline-flex w-full justify-center rounded-lg border border-accent/40 bg-gradient-to-b from-accent to-accentStrong px-4 py-2.5 text-sm font-bold text-white transition hover:from-[#a6c6ff] hover:to-[#5f8ef5]"
        >
          {isLogin ? "Войти" : "Создать аккаунт"}
        </button>
      </form>

      <p className="mt-4 text-sm text-muted">
        {isLogin ? "Нет аккаунта?" : "Уже есть аккаунт?"}{" "}
        <Link href={isLogin ? "/register" : "/login"} className="font-semibold text-accent hover:underline">
          {isLogin ? "Регистрация" : "Вход"}
        </Link>
      </p>

      {message ? (
        <p className="mt-3 rounded-lg border border-line bg-[#0d131e] px-3 py-2 text-sm text-slate-100">
          {message}
        </p>
      ) : null}
    </section>
  );
}
