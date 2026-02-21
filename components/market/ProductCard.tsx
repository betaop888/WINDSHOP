"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import { ITEM_TEXTURE_BASE } from "@/lib/constants";
import { MarketItem } from "@/lib/types";

type ProductCardProps = {
  item: MarketItem;
  onCreateRequest: (payload: { item: MarketItem; quantity: number; offeredPriceAr: number }) => void;
};

export function ProductCard({ item, onCreateRequest }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [brokenImage, setBrokenImage] = useState(false);

  const textureUrl = useMemo(
    () => `${ITEM_TEXTURE_BASE}/${encodeURIComponent(item.texture)}.png`,
    [item.texture]
  );

  const offeredPrice = useMemo(() => item.priceAr * quantity, [item.priceAr, quantity]);

  return (
    <article className="rounded-2xl border border-line bg-panel/95 p-3 shadow-card">
      <div className="relative mb-3 aspect-square overflow-hidden rounded-xl border border-slate-700/60 bg-gradient-to-br from-[#252c3a] to-[#111722]">
        {!brokenImage ? (
          <Image
            src={textureUrl}
            alt={item.name}
            width={96}
            height={96}
            loading="lazy"
            onError={() => setBrokenImage(true)}
            className="absolute inset-0 m-auto h-24 w-24 object-contain [image-rendering:pixelated]"
          />
        ) : (
          <div className="grid h-full place-items-center text-xs font-semibold tracking-[0.16em] text-slate-300">
            NO ICON
          </div>
        )}

        <span className="absolute bottom-2 left-2 rounded-md border border-white/20 bg-black/45 px-2 py-0.5 text-[10px] font-bold tracking-[0.12em] text-slate-100">
          {item.token}
        </span>
      </div>

      <p className="text-lg font-extrabold leading-none">
        {item.priceAr} ар{" "}
        <span className="text-xs font-semibold text-muted">/ {item.lotLabel}</span>
      </p>
      <h3 className="mt-1 line-clamp-2 text-[15px] font-bold">{item.name}</h3>
      <p className="mt-1 min-h-8 text-xs text-muted">{item.description}</p>

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
          onClick={() => onCreateRequest({ item, quantity, offeredPriceAr: offeredPrice })}
          className="inline-flex h-fit items-center justify-center gap-2 self-end rounded-lg border border-accent/40 bg-gradient-to-b from-accent to-accentStrong px-4 py-2 text-sm font-bold text-white transition hover:from-[#a6c6ff] hover:to-[#5f8ef5]"
        >
          <ShoppingCart size={15} />
          Купить
        </button>
      </div>
    </article>
  );
}
