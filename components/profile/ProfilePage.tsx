"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { ShieldAlert, ShieldCheck, Star } from "lucide-react";
import { useAppState } from "@/components/providers/AppStateProvider";
import { AccountProfile, Review } from "@/lib/types";

type ProfilePageProps = {
  username: string;
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(date);
}

function renderStars(rating: number) {
  return (
    <span className="inline-flex items-center gap-0.5 text-amber-300">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star key={index} size={14} fill={index < rating ? "currentColor" : "none"} />
      ))}
    </span>
  );
}

export function ProfilePage({ username }: ProfilePageProps) {
  const { currentUser, updateMyBio, setUserBan } = useAppState();
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [bioDraft, setBioDraft] = useState("");
  const [reviewDraft, setReviewDraft] = useState({ rating: 5, comment: "" });
  const [banReason, setBanReason] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submittingReview, setSubmittingReview] = useState(false);

  const isOwnProfile = useMemo(
    () => currentUser?.username.toLowerCase() === username.toLowerCase(),
    [currentUser?.username, username]
  );

  const isAdmin = currentUser?.role === "ADMIN";

  const averageRating = useMemo(() => {
    if (!reviews.length) return null;
    const total = reviews.reduce((sum, item) => sum + item.rating, 0);
    return Number((total / reviews.length).toFixed(1));
  }, [reviews]);

  const loadProfile = useCallback(async () => {
    const response = await fetch(`/api/profiles/${encodeURIComponent(username)}`);
    const json = (await response.json()) as { profile?: AccountProfile; message?: string };

    if (!response.ok || !json.profile) {
      throw new Error(json.message || "Профиль не найден.");
    }

    setProfile(json.profile);
    setBioDraft(json.profile.bio ?? "");
    setBanReason(json.profile.banReason ?? "");
  }, [username]);

  const loadReviews = useCallback(async () => {
    const response = await fetch(`/api/profiles/${encodeURIComponent(username)}/reviews`);
    const json = (await response.json()) as { reviews?: Review[]; message?: string };

    if (!response.ok) {
      throw new Error(json.message || "Не удалось загрузить отзывы.");
    }

    setReviews(json.reviews ?? []);
  }, [username]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setMessage(null);

    void (async () => {
      try {
        await Promise.all([loadProfile(), loadReviews()]);
      } catch (error) {
        if (!active) return;
        setMessage(error instanceof Error ? error.message : "Ошибка загрузки профиля.");
        setProfile(null);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [loadProfile, loadReviews]);

  async function onBioSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await updateMyBio(bioDraft);
    setMessage(result.message);
    if (!result.ok) return;

    setProfile((prev) => (prev ? { ...prev, bio: bioDraft || null } : prev));
  }

  async function onReviewSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!currentUser) {
      setMessage("Сначала войдите через Discord.");
      return;
    }

    const comment = reviewDraft.comment.trim();
    if (comment.length < 3) {
      setMessage("Отзыв должен быть минимум 3 символа.");
      return;
    }

    setSubmittingReview(true);
    try {
      const response = await fetch(`/api/profiles/${encodeURIComponent(username)}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: reviewDraft.rating, comment })
      });

      const json = (await response.json()) as { message?: string };
      if (!response.ok) {
        setMessage(json.message || "Не удалось сохранить отзыв.");
        return;
      }

      setMessage("Отзыв сохранён.");
      setReviewDraft({ rating: 5, comment: "" });
      await loadReviews();
    } finally {
      setSubmittingReview(false);
    }
  }

  async function onBanToggle() {
    if (!profile) return;

    const nextBanState = !profile.isBanned;
    const result = await setUserBan(profile.username, nextBanState, banReason);
    setMessage(result.message);
    if (!result.ok) return;

    await loadProfile();
  }

  if (loading) {
    return <p className="text-sm text-muted">Загрузка профиля...</p>;
  }

  if (!profile) {
    return (
      <section className="rounded-2xl border border-line bg-panel/95 p-5">
        <h1 className="font-display text-2xl">Профиль</h1>
        <p className="mt-2 text-sm text-rose-300">{message || "Профиль не найден."}</p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-line bg-panel/95 p-5">
        <h1 className="font-display text-2xl">
          @{profile.username}
          {profile.role === "ADMIN" ? (
            <span className="ml-2 rounded-full border border-amber-300/40 px-2 py-0.5 text-xs text-amber-300">ADMIN</span>
          ) : null}
        </h1>

        {profile.displayName && profile.displayName !== profile.username ? (
          <p className="mt-1 text-sm text-slate-200">Ник в Discord: {profile.displayName}</p>
        ) : null}

        <p className="mt-1 text-xs text-muted">Дата регистрации: {formatDate(profile.createdAt)}</p>

        {profile.isBanned ? (
          <div className="mt-3 rounded-xl border border-rose-300/35 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
            Аккаунт заблокирован.
            {profile.banReason ? <span className="ml-1">Причина: {profile.banReason}</span> : null}
          </div>
        ) : null}

        {isOwnProfile ? (
          <form onSubmit={onBioSubmit} className="mt-4 max-w-xl space-y-2">
            <label className="block text-sm text-muted">
              О себе
              <textarea
                value={bioDraft}
                onChange={(event) => setBioDraft(event.target.value)}
                maxLength={180}
                rows={3}
                className="mt-1 w-full rounded-lg border border-line bg-[#070b11] px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-500"
                placeholder="Расскажите, чем торгуете..."
              />
            </label>
            <button
              type="submit"
              className="rounded-lg border border-accent/40 bg-gradient-to-b from-accent to-accentStrong px-4 py-2 text-sm font-semibold text-white"
            >
              Сохранить профиль
            </button>
          </form>
        ) : (
          <p className="mt-3 text-sm text-slate-200">{profile.bio || "Пользователь пока не добавил описание."}</p>
        )}

        {isAdmin && !isOwnProfile ? (
          <div className="mt-4 max-w-xl space-y-2 rounded-xl border border-line bg-[#070b11] p-3">
            <p className="text-xs text-muted">Админ-панель пользователя</p>
            <label className="block text-xs text-muted">
              Причина бана
              <input
                type="text"
                value={banReason}
                onChange={(event) => setBanReason(event.target.value)}
                maxLength={180}
                className="mt-1 w-full rounded-lg border border-line bg-[#0d131e] px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-500"
                placeholder="Например: нарушение правил торговли"
              />
            </label>
            <button
              type="button"
              onClick={() => void onBanToggle()}
              className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold ${
                profile.isBanned
                  ? "border-emerald-300/40 text-emerald-300 hover:bg-emerald-400/10"
                  : "border-rose-300/40 text-rose-300 hover:bg-rose-400/10"
              }`}
            >
              {profile.isBanned ? <ShieldCheck size={16} /> : <ShieldAlert size={16} />}
              {profile.isBanned ? "Снять бан" : "Забанить"}
            </button>
          </div>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <article className="rounded-xl border border-line bg-panel/95 p-4">
          <p className="text-xs text-muted">Открытых создано</p>
          <p className="mt-1 text-2xl font-bold text-emerald-300">{profile.stats.createdOpen}</p>
        </article>
        <article className="rounded-xl border border-line bg-panel/95 p-4">
          <p className="text-xs text-muted">Всего создано</p>
          <p className="mt-1 text-2xl font-bold text-slate-100">{profile.stats.createdTotal}</p>
        </article>
        <article className="rounded-xl border border-line bg-panel/95 p-4">
          <p className="text-xs text-muted">Взято сейчас</p>
          <p className="mt-1 text-2xl font-bold text-blue-300">{profile.stats.claimedActive}</p>
        </article>
        <article className="rounded-xl border border-line bg-panel/95 p-4">
          <p className="text-xs text-muted">Сделок как продавец</p>
          <p className="mt-1 text-2xl font-bold text-cyan-300">{profile.stats.completedSales}</p>
        </article>
        <article className="rounded-xl border border-line bg-panel/95 p-4">
          <p className="text-xs text-muted">Успешных сделок (всего)</p>
          <p className="mt-1 text-2xl font-bold text-sky-300">{profile.stats.successfulDealsTotal}</p>
        </article>
      </div>

      <section className="space-y-3 rounded-2xl border border-line bg-panel/95 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-lg">Отзывы</h2>
            <p className="text-xs text-muted">
              {averageRating !== null ? `Средняя оценка: ${averageRating}/5` : "Оценок пока нет"}
            </p>
          </div>
          {averageRating !== null ? renderStars(Math.round(averageRating)) : null}
        </div>

        {!isOwnProfile && currentUser ? (
          <form onSubmit={onReviewSubmit} className="space-y-2 rounded-xl border border-line bg-[#070b11] p-3">
            <div className="grid gap-2 sm:grid-cols-[140px_1fr]">
              <label className="text-xs text-muted">
                Оценка
                <select
                  value={reviewDraft.rating}
                  onChange={(event) =>
                    setReviewDraft((prev) => ({ ...prev, rating: Number.parseInt(event.target.value, 10) || 5 }))
                  }
                  className="mt-1 w-full rounded-lg border border-line bg-[#0d131e] px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-500"
                >
                  <option value={5}>5 - отлично</option>
                  <option value={4}>4 - хорошо</option>
                  <option value={3}>3 - нормально</option>
                  <option value={2}>2 - слабо</option>
                  <option value={1}>1 - плохо</option>
                </select>
              </label>

              <label className="text-xs text-muted">
                Комментарий
                <textarea
                  value={reviewDraft.comment}
                  onChange={(event) => setReviewDraft((prev) => ({ ...prev, comment: event.target.value }))}
                  rows={2}
                  maxLength={300}
                  placeholder="Как прошла сделка"
                  className="mt-1 w-full rounded-lg border border-line bg-[#0d131e] px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-500"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={submittingReview}
              className="rounded-lg border border-accent/40 bg-gradient-to-b from-accent to-accentStrong px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {submittingReview ? "Сохраняем..." : "Оставить отзыв"}
            </button>
          </form>
        ) : null}

        {!isOwnProfile && !currentUser ? (
          <p className="text-sm text-muted">Чтобы оставить отзыв, войдите через Discord.</p>
        ) : null}

        <div className="space-y-2">
          {reviews.length ? (
            reviews.map((review) => (
              <article key={review.id} className="rounded-xl border border-line bg-[#070b11] p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-100">
                    {review.authorDisplayName || review.authorName}
                  </p>
                  <div className="inline-flex items-center gap-2 text-xs text-muted">
                    {renderStars(review.rating)}
                    <span>{formatDate(review.createdAt)}</span>
                  </div>
                </div>
                <p className="mt-2 text-sm text-slate-200">{review.comment}</p>
              </article>
            ))
          ) : (
            <p className="text-sm text-muted">Отзывов пока нет.</p>
          )}
        </div>
      </section>

      {message ? (
        <div className="rounded-xl border border-line bg-[#0d131e] px-4 py-2 text-sm text-slate-100">{message}</div>
      ) : null}
    </section>
  );
}
