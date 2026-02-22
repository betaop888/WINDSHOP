"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  ClipboardList,
  House,
  LogOut,
  Shield,
  ShoppingCart,
  UserRound
} from "lucide-react";
import { useAppState } from "@/components/providers/AppStateProvider";

const guestNavItems = [
  { href: "/", label: "Маркет", icon: House },
  { href: "/requests", label: "Заявки", icon: ClipboardList },
  { href: "/login", label: "Вход", icon: UserRound }
];

const userNavItems = [
  { href: "/", label: "Маркет", icon: House },
  { href: "/requests", label: "Заявки", icon: ClipboardList }
];

function navClass(isActive: boolean) {
  return [
    "relative grid h-9 w-9 place-items-center rounded-lg border transition",
    isActive
      ? "border-accent/50 bg-accent/15 text-accent"
      : "border-transparent text-slate-200 hover:bg-white/5"
  ].join(" ");
}

export function Header() {
  const pathname = usePathname();
  const {
    currentUser,
    logout,
    requests,
    cartItems,
    claimRequest,
    completeRequest
  } = useAppState();

  const navItems = currentUser ? userNavItems : guestNavItems;
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const sellerNotifications = useMemo(() => {
    if (!currentUser) return [];
    const current = currentUser.username.toLowerCase();

    return requests
      .filter(
        (request) =>
          request.status === "OPEN" &&
          request.preferredSellerName?.toLowerCase() === current
      )
      .sort((a, b) => Number(new Date(b.createdAt)) - Number(new Date(a.createdAt)));
  }, [currentUser, requests]);

  const buyerConfirmNotifications = useMemo(() => {
    if (!currentUser) return [];
    const current = currentUser.username.toLowerCase();

    return requests
      .filter(
        (request) =>
          request.status === "AWAITING_BUYER_CONFIRM" &&
          request.creatorName.toLowerCase() === current
      )
      .sort((a, b) => Number(new Date(b.updatedAt)) - Number(new Date(a.updatedAt)));
  }, [currentUser, requests]);

  const disputeNotifications = useMemo(() => {
    if (!currentUser || currentUser.role !== "ADMIN") return [];
    return requests
      .filter((request) => request.status === "DISPUTED")
      .sort((a, b) => Number(new Date(b.updatedAt)) - Number(new Date(a.updatedAt)));
  }, [currentUser, requests]);

  const notificationsCount =
    sellerNotifications.length + buyerConfirmNotifications.length + disputeNotifications.length;

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 2500);
    return () => clearTimeout(timer);
  }, [message]);

  return (
    <header className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-start md:justify-between">
      <div className="flex items-center gap-4">
        <div className="h-9 w-16 rounded-sm bg-slate-300" />
        <div>
          <p className="font-display text-sm tracking-[0.14em] text-white md:text-base">WIND SHOP</p>
          <p className="text-xs text-muted">Валюта: ары (алмазная руда)</p>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2">
        <nav className="relative flex items-center gap-1 rounded-xl border border-line bg-panel/90 p-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} title={item.label} className={navClass(isActive)}>
                <Icon size={17} strokeWidth={1.9} />
              </Link>
            );
          })}

          {currentUser ? (
            <Link href="/cart" title="Корзина" className={navClass(pathname === "/cart")}>
              <ShoppingCart size={17} strokeWidth={1.9} />
              {cartItems.length ? (
                <span className="absolute -right-1 -top-1 rounded-full border border-line bg-[#0d131e] px-1.5 text-[10px] font-semibold text-accent">
                  {cartItems.length}
                </span>
              ) : null}
            </Link>
          ) : null}

          {currentUser ? (
            <Link
              href={`/profile/${encodeURIComponent(currentUser.username)}`}
              title="Профиль"
              className={navClass(pathname.startsWith("/profile/"))}
            >
              <UserRound size={17} strokeWidth={1.9} />
            </Link>
          ) : null}

          <button
            type="button"
            title="Уведомления"
            onClick={() => setNotificationsOpen((prev) => !prev)}
            className="relative grid h-9 w-9 place-items-center rounded-lg border border-transparent text-slate-200 hover:bg-white/5"
            aria-label="Уведомления"
          >
            <Bell size={17} strokeWidth={1.9} />
            {currentUser && notificationsCount ? (
              <span className="absolute -right-1 -top-1 rounded-full border border-line bg-[#0d131e] px-1.5 text-[10px] font-semibold text-accent">
                {notificationsCount}
              </span>
            ) : null}
          </button>

          {notificationsOpen ? (
            <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-[380px] rounded-xl border border-line bg-[#0d131e] p-3 shadow-card">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-100">Уведомления</p>
                <Link
                  href="/requests"
                  onClick={() => setNotificationsOpen(false)}
                  className="text-xs text-accent hover:underline"
                >
                  Центр сделок
                </Link>
              </div>

              {!currentUser ? (
                <p className="text-xs text-muted">Войдите, чтобы видеть уведомления.</p>
              ) : (
                <div className="max-h-80 space-y-3 overflow-auto pr-1">
                  {sellerNotifications.length ? (
                    <section>
                      <p className="mb-1 text-[11px] uppercase tracking-[0.12em] text-muted">Входящие покупки</p>
                      <div className="space-y-2">
                        {sellerNotifications.slice(0, 4).map((request) => (
                          <article key={request.id} className="rounded-lg border border-line bg-[#070b11] p-2">
                            <p className="text-sm font-semibold text-slate-100">{request.itemName}</p>
                            <p className="mt-1 text-xs text-muted">
                              Покупатель: <span className="text-slate-200">{request.creatorName}</span>
                            </p>
                            <p className="text-xs text-muted">
                              {request.quantity} шт • <span className="text-accent">{request.offeredPriceAr} ар</span>
                            </p>

                            <div className="mt-2 flex gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  void claimRequest(request.id).then((result) => setMessage(result.message));
                                  setNotificationsOpen(false);
                                }}
                                className="rounded-md border border-accent/35 px-2 py-1 text-xs text-accent hover:bg-accent/10"
                              >
                                Взяться
                              </button>
                              <Link
                                href="/requests"
                                onClick={() => setNotificationsOpen(false)}
                                className="rounded-md border border-line px-2 py-1 text-xs text-slate-200 hover:border-slate-500"
                              >
                                Открыть
                              </Link>
                            </div>
                          </article>
                        ))}
                      </div>
                    </section>
                  ) : null}

                  {buyerConfirmNotifications.length ? (
                    <section>
                      <p className="mb-1 text-[11px] uppercase tracking-[0.12em] text-muted">Нужно подтвердить</p>
                      <div className="space-y-2">
                        {buyerConfirmNotifications.slice(0, 4).map((request) => (
                          <article key={request.id} className="rounded-lg border border-line bg-[#070b11] p-2">
                            <p className="text-sm font-semibold text-slate-100">{request.itemName}</p>
                            <p className="mt-1 text-xs text-muted">
                              Продавец: <span className="text-slate-200">{request.claimerName || "-"}</span>
                            </p>
                            <p className="text-xs text-muted">
                              {request.quantity} шт • <span className="text-accent">{request.offeredPriceAr} ар</span>
                            </p>

                            <div className="mt-2 flex gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  void completeRequest(request.id).then((result) => setMessage(result.message));
                                  setNotificationsOpen(false);
                                }}
                                className="rounded-md border border-emerald-300/40 px-2 py-1 text-xs text-emerald-300 hover:bg-emerald-400/10"
                              >
                                Подтвердить
                              </button>
                              <Link
                                href="/requests"
                                onClick={() => setNotificationsOpen(false)}
                                className="rounded-md border border-line px-2 py-1 text-xs text-slate-200 hover:border-slate-500"
                              >
                                Открыть
                              </Link>
                            </div>
                          </article>
                        ))}
                      </div>
                    </section>
                  ) : null}

                  {disputeNotifications.length ? (
                    <section>
                      <p className="mb-1 text-[11px] uppercase tracking-[0.12em] text-muted">Споры (админ)</p>
                      <div className="space-y-2">
                        {disputeNotifications.slice(0, 4).map((request) => (
                          <article key={request.id} className="rounded-lg border border-rose-400/30 bg-rose-500/10 p-2">
                            <p className="text-sm font-semibold text-rose-200">{request.itemName}</p>
                            <p className="mt-1 text-xs text-rose-100/80">{request.disputeComment || "Без комментария"}</p>
                            <Link
                              href="/requests"
                              onClick={() => setNotificationsOpen(false)}
                              className="mt-2 inline-flex rounded-md border border-rose-300/40 px-2 py-1 text-xs text-rose-200 hover:bg-rose-400/10"
                            >
                              Перейти в арбитраж
                            </Link>
                          </article>
                        ))}
                      </div>
                    </section>
                  ) : null}

                  {!sellerNotifications.length &&
                  !buyerConfirmNotifications.length &&
                  !disputeNotifications.length ? (
                    <p className="text-xs text-muted">Новых уведомлений пока нет.</p>
                  ) : null}
                </div>
              )}
            </div>
          ) : null}
        </nav>

        <p className="text-xs text-muted">
          Игрок:{" "}
          <span className="font-semibold text-slate-100">
            {currentUser?.displayName || currentUser?.username || "Гость"}
          </span>

          {currentUser?.role === "ADMIN" ? (
            <span className="ml-2 inline-flex items-center gap-1 rounded-full border border-amber-300/40 px-2 py-0.5 text-[11px] text-amber-300">
              <Shield size={11} />
              Админ
            </span>
          ) : null}

          {currentUser ? (
            <>
              <Link
                href={`/profile/${encodeURIComponent(currentUser.username)}`}
                className="ml-2 rounded-full border border-line px-2 py-0.5 text-[11px] text-slate-200 hover:border-slate-500"
              >
                Профиль
              </Link>
              <button
                type="button"
                onClick={() => void logout()}
                className="ml-2 inline-flex items-center gap-1 rounded-full border border-line px-2 py-0.5 text-[11px] text-slate-200 hover:border-slate-500"
              >
                <LogOut size={12} />
                Выйти
              </button>
            </>
          ) : null}
        </p>
      </div>

      {message ? (
        <div className="fixed bottom-4 right-4 z-50 rounded-xl border border-line bg-[#0d131e] px-4 py-2 text-sm text-slate-100 shadow-card">
          {message}
        </div>
      ) : null}
    </header>
  );
}
