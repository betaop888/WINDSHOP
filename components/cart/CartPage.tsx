"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ShoppingCart, Trash2 } from "lucide-react";
import { useAppState } from "@/components/providers/AppStateProvider";
import { ITEM_TEXTURE_BASE } from "@/lib/constants";

export function CartPage() {
  const {
    currentUser,
    cartItems,
    updateCartItemQuantity,
    removeCartItem,
    clearCart,
    confirmCartItem,
    checkoutCart
  } = useAppState();

  const [message, setMessage] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [isSubmittingAll, setIsSubmittingAll] = useState(false);

  const totalAr = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity * item.priceAr, 0),
    [cartItems]
  );

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [message]);

  async function onConfirmOne(itemKey: string) {
    setBusyKey(itemKey);
    const result = await confirmCartItem(itemKey);
    setBusyKey(null);
    setMessage(result.message);
  }

  async function onConfirmAll() {
    setIsSubmittingAll(true);
    const result = await checkoutCart();
    setIsSubmittingAll(false);
    setMessage(result.message);
  }

  if (!currentUser) {
    return (
      <section className="rounded-2xl border border-line bg-panel/95 p-5">
        <h1 className="font-display text-xl md:text-2xl">Корзина</h1>
        <p className="mt-2 text-sm text-muted">Чтобы использовать корзину, войдите через Discord.</p>
        <Link
          href="/login"
          className="mt-4 inline-flex rounded-lg border border-accent/40 bg-gradient-to-b from-accent to-accentStrong px-4 py-2 text-sm font-semibold text-white"
        >
          Войти
        </Link>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-xl md:text-2xl">Корзина покупок</h1>
          <p className="mt-1 text-sm text-muted">
            После подтверждения покупки продавцу придёт уведомление в меню колокольчика.
          </p>
        </div>

        <div className="rounded-xl border border-line bg-panel px-4 py-2 text-right">
          <p className="text-xs text-muted">Позиций</p>
          <p className="text-lg font-bold text-slate-100">{cartItems.length}</p>
        </div>
      </div>

      {cartItems.length ? (
        <>
          <div className="space-y-2">
            {cartItems.map((item) => {
              const imageSrc = item.imageUrl
                ? item.imageUrl
                : item.texture
                  ? `${ITEM_TEXTURE_BASE}/${encodeURIComponent(item.texture)}.png`
                  : "";

              return (
                <article
                  key={item.key}
                  className="flex flex-col gap-3 rounded-2xl border border-line bg-panel/95 p-3 md:flex-row md:items-center"
                >
                  <div className="grid h-16 w-16 shrink-0 place-items-center rounded-xl border border-line bg-[#070b11]">
                    {imageSrc ? (
                      <img
                        src={imageSrc}
                        alt={item.itemName}
                        className={["h-12 w-12 object-contain", item.texture ? "[image-rendering:pixelated]" : ""].join(" ")}
                      />
                    ) : (
                      <ShoppingCart size={18} className="text-slate-400" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold text-slate-100">{item.itemName}</h3>
                    <p className="text-xs text-muted">{item.priceAr} ар / {item.lotLabel}</p>
                    {item.ownerName ? <p className="text-xs text-muted">Продавец: {item.ownerName}</p> : null}
                  </div>

                  <label className="text-xs text-muted">
                    Лотов
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(event) => {
                        const next = Number.parseInt(event.target.value, 10);
                        updateCartItemQuantity(item.key, Number.isFinite(next) && next > 0 ? next : 1);
                      }}
                      className="mt-1 w-24 rounded-lg border border-line bg-[#070b11] px-2 py-1.5 text-sm text-slate-100"
                    />
                  </label>

                  <div className="text-right">
                    <p className="text-xs text-muted">Итого</p>
                    <p className="text-sm font-bold text-accent">{item.quantity * item.priceAr} ар</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => void onConfirmOne(item.key)}
                      disabled={busyKey === item.key}
                      className="rounded-lg border border-accent/40 bg-gradient-to-b from-accent to-accentStrong px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
                    >
                      {busyKey === item.key ? "..." : "Подтвердить"}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeCartItem(item.key)}
                      className="inline-flex items-center gap-1 rounded-lg border border-rose-300/40 px-3 py-2 text-xs text-rose-300 hover:bg-rose-400/10"
                    >
                      <Trash2 size={13} />
                      Удалить
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-line bg-panel/95 p-4">
            <div>
              <p className="text-xs text-muted">Общая сумма</p>
              <p className="text-xl font-bold text-accent">{totalAr} ар</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={clearCart}
                className="rounded-lg border border-line px-4 py-2 text-sm text-slate-200 hover:border-slate-500"
              >
                Очистить
              </button>
              <button
                type="button"
                onClick={() => void onConfirmAll()}
                disabled={isSubmittingAll}
                className="rounded-lg border border-accent/40 bg-gradient-to-b from-accent to-accentStrong px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {isSubmittingAll ? "Отправка..." : "Подтвердить все"}
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-2xl border border-line bg-panel/95 p-5 text-sm text-muted">
          Корзина пока пустая. Добавьте предметы из каталога.
        </div>
      )}

      {message ? (
        <div className="fixed bottom-4 right-4 z-50 rounded-xl border border-line bg-[#0d131e] px-4 py-2 text-sm text-slate-100 shadow-card">
          {message}
        </div>
      ) : null}
    </section>
  );
}
