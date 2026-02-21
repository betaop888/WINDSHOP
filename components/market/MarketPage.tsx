"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ProductCard } from "@/components/market/ProductCard";
import { useAppState } from "@/components/providers/AppStateProvider";
import { PurchaseRequestsTable } from "@/components/requests/PurchaseRequestsTable";
import {
  BASE_MARKET_ITEMS,
  fetchSourceItems,
  mergeItemsWithSource
} from "@/lib/market-catalog";
import { MarketItem } from "@/lib/types";

type SortMode = "featured" | "priceAsc" | "priceDesc" | "nameAsc";

const slides = [
  {
    title: "АРЕНДА БАНЕРА 8 АР/В СУТКИ",
    subtitle: "Продвигай свой магазин на главной витрине."
  },
  {
    title: "КНИГИ, АЛМАЗНЫЕ И НЕЗЕРИТОВЫЕ ЛОТЫ",
    subtitle: "Категории и сетка в стиле вашего reference."
  },
  {
    title: "ОПЛАТА В ВАЛЮТЕ АРЫ",
    subtitle: "1 ар = 1 алмазная руда."
  }
];

export function MarketPage() {
  const router = useRouter();
  const { currentUser, requests, addRequest, removeRequest } = useAppState();
  const [items, setItems] = useState<MarketItem[]>(BASE_MARKET_ITEMS);
  const [category, setCategory] = useState<string>("all");
  const [sortMode, setSortMode] = useState<SortMode>("featured");
  const [slideIndex, setSlideIndex] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    fetchSourceItems()
      .then((sourceItems) => {
        if (!isMounted) return;
        setItems(mergeItemsWithSource(sourceItems));
      })
      .catch(() => {
        if (!isMounted) return;
        setItems(BASE_MARKET_ITEMS);
      });

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 2400);
    return () => clearTimeout(timer);
  }, [message]);

  const categories = useMemo(() => {
    return [...new Set(items.map((item) => item.category))];
  }, [items]);

  const visibleItems = useMemo(() => {
    let filtered = items;
    if (category !== "all") {
      filtered = filtered.filter((item) => item.category === category);
    }

    if (sortMode === "priceAsc") {
      filtered = [...filtered].sort((a, b) => a.priceAr - b.priceAr);
    } else if (sortMode === "priceDesc") {
      filtered = [...filtered].sort((a, b) => b.priceAr - a.priceAr);
    } else if (sortMode === "nameAsc") {
      filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name, "ru"));
    }

    return filtered;
  }, [category, items, sortMode]);

  function handleCreateRequest(payload: {
    item: MarketItem;
    quantity: number;
    offeredPriceAr: number;
  }) {
    if (!currentUser) {
      setMessage("Для покупки нужен вход по нику и паролю.");
      router.push("/login");
      return;
    }

    const result = addRequest({
      itemId: payload.item.id,
      itemName: payload.item.name,
      quantity: payload.quantity * payload.item.lotSize,
      offeredPriceAr: payload.offeredPriceAr
    });
    setMessage(result.message);
  }

  return (
    <section className="space-y-5 md:space-y-6">
      <div className="grid min-h-[112px] grid-cols-[44px_1fr_44px] items-center rounded-2xl border border-line bg-gradient-to-b from-[#0d121a] to-[#070b11]">
        <button
          type="button"
          onClick={() => setSlideIndex((prev) => (prev + slides.length - 1) % slides.length)}
          className="mx-auto grid h-8 w-8 place-items-center rounded-lg text-slate-200 transition hover:bg-white/5"
          aria-label="Предыдущий слайд"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="text-center">
          <p className="font-display text-lg tracking-[0.03em] md:text-2xl">{slides[slideIndex].title}</p>
          <p className="mt-1 text-xs text-muted md:text-sm">{slides[slideIndex].subtitle}</p>
          <div className="mt-2 flex justify-center gap-1">
            {slides.map((_, index) => (
              <span
                key={index}
                className={`h-1.5 w-1.5 rounded-full ${index === slideIndex ? "bg-white" : "bg-white/25"}`}
              />
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setSlideIndex((prev) => (prev + 1) % slides.length)}
          className="mx-auto grid h-8 w-8 place-items-center rounded-lg text-slate-200 transition hover:bg-white/5"
          aria-label="Следующий слайд"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="flex flex-wrap gap-2 md:gap-3">
        <label className="text-xs text-muted">
          Категория
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="mt-1 block min-w-44 rounded-full border border-line bg-panel px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-500"
          >
            <option value="all">Все категории</option>
            {categories.map((entry) => (
              <option key={entry} value={entry}>
                {entry}
              </option>
            ))}
          </select>
        </label>

        <label className="text-xs text-muted">
          Сортировка
          <select
            value={sortMode}
            onChange={(event) => setSortMode(event.target.value as SortMode)}
            className="mt-1 block min-w-44 rounded-full border border-line bg-panel px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-500"
          >
            <option value="featured">По умолчанию</option>
            <option value="priceAsc">Сначала дешевые</option>
            <option value="priceDesc">Сначала дорогие</option>
            <option value="nameAsc">По названию</option>
          </select>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {visibleItems.map((item) => (
          <ProductCard key={item.id} item={item} onCreateRequest={handleCreateRequest} />
        ))}
      </div>

      <section className="space-y-3 pt-2">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="font-display text-lg md:text-xl">Заявки на покупку</h2>
            <p className="text-xs text-muted md:text-sm">
              Список активных запросов: предмет, ник, количество, цена в арах.
            </p>
          </div>
          <Link
            href="/requests"
            className="rounded-full border border-line px-3 py-1.5 text-xs text-slate-200 transition hover:border-slate-500"
          >
            Открыть весь список
          </Link>
        </div>

        <PurchaseRequestsTable
          requests={requests}
          currentUser={currentUser}
          onRemoveRequest={removeRequest}
          compact
        />
      </section>

      {message ? (
        <div className="fixed bottom-4 right-4 z-50 rounded-xl border border-line bg-[#0d131e] px-4 py-2 text-sm text-slate-100 shadow-card">
          {message}
        </div>
      ) : null}
    </section>
  );
}
