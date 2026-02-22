"use client";

/* eslint-disable @next/next/no-img-element */
import { useMemo, useState } from "react";
import { MoreHorizontal, ShoppingCart } from "lucide-react";
import { ITEM_TEXTURE_BASE } from "@/lib/constants";
import { MarketItem } from "@/lib/types";

type ProductCardProps = {
  item: MarketItem;
  canManage?: boolean;
  onEdit?: (item: MarketItem) => void;
  onDelete?: (item: MarketItem) => void;
  onCreateRequest: (payload: {
    item: MarketItem;
    quantity: number;
    offeredPriceAr: number;
    listingId?: string;
  }) => void;
};

export function ProductCard({
  item,
  canManage = false,
  onEdit,
  onDelete,
  onCreateRequest
}: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [brokenImage, setBrokenImage] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const imageSrc = useMemo(() => {
    if (item.imageUrl) return item.imageUrl;
    if (item.texture) return `${ITEM_TEXTURE_BASE}/${encodeURIComponent(item.texture)}.png`;
    return "";
  }, [item.imageUrl, item.texture]);

  const offeredPrice = useMemo(() => item.priceAr * quantity, [item.priceAr, quantity]);

  return (
    <article className="rounded-2xl border border-line bg-panel/95 p-3 shadow-card">
      <div className="relative mb-3 aspect-square overflow-hidden rounded-xl border border-slate-700/60 bg-gradient-to-br from-[#252c3a] to-[#111722]">
        {imageSrc && !brokenImage ? (
          <img
            src={imageSrc}
            alt={item.name}
            loading="lazy"
            onError={() => setBrokenImage(true)}
            className={[
              "absolute inset-0 m-auto h-24 w-24 object-contain",
              item.texture ? "[image-rendering:pixelated]" : ""
            ].join(" ")}
          />
        ) : (
          <div className="grid h-full place-items-center text-xs font-semibold tracking-[0.16em] text-slate-300">
            NO ICON
          </div>
        )}

        <span className="absolute bottom-2 left-2 rounded-md border border-white/20 bg-black/45 px-2 py-0.5 text-[10px] font-bold tracking-[0.12em] text-slate-100">
          {item.token}
        </span>

        {canManage ? (
          <div className="absolute right-2 top-2">
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="rounded-md border border-white/20 bg-black/40 p-1 text-slate-200 hover:bg-black/60"
              aria-label="Меню товара"
            >
              <MoreHorizontal size={14} />
            </button>

            {menuOpen ? (
              <div className="absolute right-0 mt-1 w-36 rounded-lg border border-line bg-[#0d131e] p-1 text-xs shadow-card">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit?.(item);
                  }}
                  className="block w-full rounded-md px-2 py-1 text-left text-slate-100 hover:bg-white/10"
                >
                  Редактировать
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete?.(item);
                  }}
                  className="block w-full rounded-md px-2 py-1 text-left text-rose-300 hover:bg-rose-400/10"
                >
                  Удалить
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <p className="text-lg font-extrabold leading-none">
        {item.priceAr} ар <span className="text-xs font-semibold text-muted">/ {item.lotLabel}</span>
      </p>
      <h3 className="mt-1 min-h-10 text-[15px] font-bold">{item.name}</h3>
      <p className="mt-1 min-h-10 text-xs text-muted">{item.description}</p>
      {item.ownerName ? <p className="mt-1 text-[11px] text-muted">Продавец: {item.ownerName}</p> : null}

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto]">
        <label className="text-[11px] text-muted">
          Лотов
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(event) => {
              const next = Number.parseInt(event.target.value, 10);
              setQuantity(Number.isFinite(next) && next > 0 ? next : 1);
            }}
            className="mt-1 w-full rounded-lg border border-line bg-[#070b12] px-2 py-2 text-sm text-slate-100 outline-none focus:border-slate-500"
          />
        </label>

        <button
          type="button"
          onClick={() =>
            onCreateRequest({
              item,
              quantity,
              offeredPriceAr: offeredPrice,
              listingId: item.listingId
            })
          }
          className="inline-flex h-fit items-center justify-center gap-2 self-end rounded-lg border border-accent/40 bg-gradient-to-b from-accent to-accentStrong px-4 py-2 text-sm font-bold text-white transition hover:from-[#a6c6ff] hover:to-[#5f8ef5]"
        >
          <ShoppingCart size={15} />
          Купить
        </button>
      </div>
    </article>
  );
}
