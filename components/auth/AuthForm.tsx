"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { ShieldCheck, Sparkles } from "lucide-react";
import { useAppState } from "@/components/providers/AppStateProvider";

type AuthMode = "login" | "register";

type AuthFormProps = {
  mode: AuthMode;
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const { login, register } = useAppState();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const isLogin = mode === "login";
  const hint = useMemo(() => /^[a-zA-Z0-9_]{0,24}$/.test(username), [username]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);

    try {
      const result = isLogin
        ? await login(username, password)
        : await register(username, password, repeatPassword);

      setMessage(result.message);
      if (!result.ok) return;

      router.push("/");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-md rounded-2xl border border-line bg-panel/95 p-6 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl">{isLogin ? "Welcome Back" : "Create Account"}</h1>
          <p className="mt-1 text-sm text-muted">
            {isLogin
              ? "Sign in with your username and password."
              : "Use an English username to join the live marketplace."}
          </p>
        </div>
        <Sparkles className="text-accent" size={24} />
      </div>

      <form className="space-y-3" onSubmit={onSubmit}>
        <label className="block text-sm text-muted">
          Username
          <input
            type="text"
            value={username}
            minLength={3}
            maxLength={24}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="ex: Steve_21"
            required
            className="mt-1 w-full rounded-lg border border-line bg-[#070b11] px-3 py-2 text-slate-100 outline-none transition focus:border-slate-500"
          />
          {!hint ? (
            <span className="mt-1 block text-xs text-rose-300">
              Use only A-Z, a-z, 0-9 and underscore.
            </span>
          ) : (
            <span className="mt-1 block text-xs text-muted">3-24 chars, English only.</span>
          )}
        </label>

        <label className="block text-sm text-muted">
          Password
          <input
            type="password"
            value={password}
            minLength={6}
            maxLength={40}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            required
            className="mt-1 w-full rounded-lg border border-line bg-[#070b11] px-3 py-2 text-slate-100 outline-none transition focus:border-slate-500"
          />
        </label>

        {!isLogin ? (
          <label className="block text-sm text-muted">
            Confirm Password
            <input
              type="password"
              value={repeatPassword}
              minLength={6}
              maxLength={40}
              onChange={(event) => setRepeatPassword(event.target.value)}
              placeholder="••••••••"
              required
              className="mt-1 w-full rounded-lg border border-line bg-[#070b11] px-3 py-2 text-slate-100 outline-none transition focus:border-slate-500"
            />
          </label>
        ) : null}

        <button
          type="submit"
          disabled={busy}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-accent/40 bg-gradient-to-b from-accent to-accentStrong px-4 py-2.5 text-sm font-bold text-white transition hover:from-[#a6c6ff] hover:to-[#5f8ef5] disabled:opacity-70"
        >
          <ShieldCheck size={16} />
          {busy ? "Please wait..." : isLogin ? "Login" : "Create account"}
        </button>
      </form>

      <p className="mt-4 text-sm text-muted">
        {isLogin ? "No account yet?" : "Already have an account?"}{" "}
        <Link href={isLogin ? "/register" : "/login"} className="font-semibold text-accent hover:underline">
          {isLogin ? "Register" : "Login"}
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
