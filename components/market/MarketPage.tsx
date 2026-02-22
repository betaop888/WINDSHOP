"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { ProductCard } from "@/components/market/ProductCard";
import { useAppState } from "@/components/providers/AppStateProvider";
import { PurchaseRequestsTable } from "@/components/requests/PurchaseRequestsTable";
import {
  BASE_MARKET_ITEMS,
  fetchSourceItems,
  mergeItemsWithSource
} from "@/lib/market-catalog";
import { MARKET_CATEGORIES, MarketCategory, MarketItem } from "@/lib/types";

type SortMode = "featured" | "priceAsc" | "priceDesc" | "nameAsc";

type ListingDraft = {
  title: string;
  description: string;
  category: MarketCategory;
  priceAr: string;
  imageUrl: string;
};

const DEFAULT_DRAFT: ListingDraft = {
  title: "",
  description: "",
  category: "Пользовательские товары",
  priceAr: "",
  imageUrl: ""
};

const slides = [
  {
    title: "АРЕНДА БАННЕРА 8 АР/СУТКИ",
    subtitle: "Строгий маркет для сервера WIND."
  },
  {
    title: "КНИГИ • АЛМАЗ • НЕЗЕРИТ",
    subtitle: "Цены подтягиваются из прайса wind.github.io"
  },
  {
    title: "ОБЩАЯ ДОСКА ЗАЯВОК",
    subtitle: "Все игроки видят активные покупки онлайн."
  }
];

function normalizeCategory(category: string): MarketCategory {
  const found = MARKET_CATEGORIES.find((entry) => entry === category);
  return found ?? "Пользовательские товары";
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Не удалось прочитать файл"));
    reader.readAsDataURL(file);
  });
}

export function MarketPage() {
  const router = useRouter();
  const {
    currentUser,
    requests,
    listings,
    loadingRequests,
    loadingListings,
    addRequest,
    claimRequest,
    releaseRequest,
    completeRequest,
    cancelRequest,
    createListing,
    updateListing,
    deleteListing
  } = useAppState();

  const [baseItems, setBaseItems] = useState<MarketItem[]>(BASE_MARKET_ITEMS);
  const [category, setCategory] = useState<string>("all");
  const [sortMode, setSortMode] = useState<SortMode>("featured");
  const [slideIndex, setSlideIndex] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingListingId, setEditingListingId] = useState<string | null>(null);
  const [listingDraft, setListingDraft] = useState<ListingDraft>(DEFAULT_DRAFT);
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    fetchSourceItems()
      .then((sourceItems) => {
        if (!isMounted) return;
        setBaseItems(mergeItemsWithSource(sourceItems));
      })
      .catch(() => {
        if (!isMounted) return;
        setBaseItems(BASE_MARKET_ITEMS);
      });

    return () => {
      isMounted = false;
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
    const timer = setTimeout(() => setMessage(null), 2800);
    return () => clearTimeout(timer);
  }, [message]);

  const listingItems = useMemo<MarketItem[]>(
    () =>
      listings.map((listing) => ({
        id: `listing-${listing.id}`,
        sourceKey: `listing-${listing.id}`,
        token: "USR",
        name: listing.title,
        category: normalizeCategory(listing.category),
        description: listing.description,
        lotSize: 1,
        lotLabel: "1 лот",
        unitLabel: "лот",
        priceAr: listing.priceAr,
        imageUrl: listing.imageUrl,
        listingId: listing.id,
        ownerName: listing.ownerName
      })),
    [listings]
  );

  const allItems = useMemo(() => [...listingItems, ...baseItems], [baseItems, listingItems]);

  const categories = useMemo(() => {
    const found = new Set<string>(allItems.map((item) => item.category));
    return ["all", ...Array.from(found)];
  }, [allItems]);

  const visibleItems = useMemo(() => {
    let filtered = allItems;
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
  }, [allItems, category, sortMode]);

  function resetEditor() {
    setEditingListingId(null);
    setListingDraft(DEFAULT_DRAFT);
    setSelectedFileName("");
  }

  function openCreateEditor() {
    if (!currentUser) {
      setMessage("Сначала войдите через Discord.");
      router.push("/login");
      return;
    }

    resetEditor();
    setIsEditorOpen(true);
  }

  function openEditEditor(item: MarketItem) {
    if (!item.listingId) return;

    const listing = listings.find((entry) => entry.id === item.listingId);
    if (!listing) return;

    setEditingListingId(listing.id);
    setListingDraft({
      title: listing.title,
      description: listing.description,
      category: normalizeCategory(listing.category),
      priceAr: String(listing.priceAr),
      imageUrl: listing.imageUrl
    });
    setSelectedFileName("");
    setIsEditorOpen(true);
  }

  async function removeListing(item: MarketItem) {
    if (!item.listingId) return;

    const confirmed = window.confirm(`Удалить товар "${item.name}"?`);
    if (!confirmed) return;

    const result = await deleteListing(item.listingId);
    setMessage(result.message);
  }

  async function handleCreateRequest(payload: {
    item: MarketItem;
    quantity: number;
    offeredPriceAr: number;
    listingId?: string;
  }) {
    if (!currentUser) {
      setMessage("Сначала войдите через Discord.");
      router.push("/login");
      return;
    }

    const result = await addRequest({
      itemId: payload.item.id,
      itemName: payload.item.name,
      quantity: payload.quantity * payload.item.lotSize,
      offeredPriceAr: payload.offeredPriceAr,
      listingId: payload.listingId
    });
    setMessage(result.message);
  }

  async function onImageFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Можно загружать только изображения.");
      return;
    }

    if (file.size > 320 * 1024) {
      setMessage("Файл слишком большой. Максимум 320 KB.");
      return;
    }

    try {
      const dataUrl = await fileToDataUrl(file);
      setListingDraft((prev) => ({ ...prev, imageUrl: dataUrl }));
      setSelectedFileName(file.name);
    } catch {
      setMessage("Не удалось загрузить изображение.");
    }
  }

  async function onListingSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!currentUser) {
      setMessage("Сначала войдите через Discord.");
      return;
    }

    const title = listingDraft.title.trim();
    const description = listingDraft.description.trim();
    const categoryValue = listingDraft.category.trim();
    const imageUrl = listingDraft.imageUrl.trim();
    const priceAr = Number.parseInt(listingDraft.priceAr, 10);

    if (title.length < 2 || title.length > 80) {
      setMessage("Название: от 2 до 80 символов.");
      return;
    }
    if (description.length < 5 || description.length > 500) {
      setMessage("Описание: от 5 до 500 символов.");
      return;
    }
    if (!imageUrl) {
      setMessage("Добавьте URL картинки или загрузите файл.");
      return;
    }
    if (!Number.isInteger(priceAr) || priceAr <= 0) {
      setMessage("Цена должна быть целым числом больше 0.");
      return;
    }

    setSubmitting(true);

    const payload = {
      title,
      description,
      category: categoryValue,
      imageUrl,
      priceAr
    };

    const result = editingListingId
      ? await updateListing(editingListingId, payload)
      : await createListing(payload);

    setSubmitting(false);
    setMessage(result.message);

    if (result.ok) {
      resetEditor();
      setIsEditorOpen(false);
    }
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

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap gap-2 md:gap-3">
          <label className="text-xs text-muted">
            Категория
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="mt-1 block min-w-44 rounded-full border border-line bg-panel px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-500"
            >
              {categories.map((entry) => (
                <option key={entry} value={entry}>
                  {entry === "all" ? "Все категории" : entry}
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
              <option value="priceAsc">Цена: по возрастанию</option>
              <option value="priceDesc">Цена: по убыванию</option>
              <option value="nameAsc">Название: А-Я</option>
            </select>
          </label>
        </div>

        <button
          type="button"
          onClick={openCreateEditor}
          className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-gradient-to-b from-accent to-accentStrong px-4 py-2 text-sm font-semibold text-white transition hover:from-[#a6c6ff] hover:to-[#5f8ef5]"
        >
          <Plus size={16} />
          Добавить товар
        </button>
      </div>

      {isEditorOpen ? (
        <form onSubmit={onListingSubmit} className="space-y-3 rounded-2xl border border-line bg-panel/95 p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="font-display text-lg">
                {editingListingId ? "Редактирование товара" : "Новый товар"}
              </h2>
              <p className="text-xs text-muted">Заполните название, цену в арах и изображение.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                resetEditor();
                setIsEditorOpen(false);
              }}
              className="rounded-lg border border-line p-1.5 text-slate-200 hover:bg-white/5"
              aria-label="Закрыть форму"
            >
              <X size={14} />
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-xs text-muted">
              Название
              <input
                type="text"
                value={listingDraft.title}
                onChange={(event) => setListingDraft((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="Например: Алмазная кирка с чарами"
                maxLength={80}
                className="mt-1 w-full rounded-lg border border-line bg-[#070b11] px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-500"
              />
            </label>

            <label className="text-xs text-muted">
              Цена (ары)
              <input
                type="number"
                min={1}
                value={listingDraft.priceAr}
                onChange={(event) => setListingDraft((prev) => ({ ...prev, priceAr: event.target.value }))}
                placeholder="1"
                className="mt-1 w-full rounded-lg border border-line bg-[#070b11] px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-500"
              />
            </label>

            <label className="text-xs text-muted">
              Категория
              <select
                value={listingDraft.category}
                onChange={(event) =>
                  setListingDraft((prev) => ({
                    ...prev,
                    category: event.target.value as MarketCategory
                  }))
                }
                className="mt-1 w-full rounded-lg border border-line bg-[#070b11] px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-500"
              >
                {MARKET_CATEGORIES.map((entry) => (
                  <option key={entry} value={entry}>
                    {entry}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-xs text-muted">
              URL изображения
              <input
                type="url"
                value={listingDraft.imageUrl.startsWith("data:image/") ? "" : listingDraft.imageUrl}
                onChange={(event) => {
                  setSelectedFileName("");
                  setListingDraft((prev) => ({ ...prev, imageUrl: event.target.value }));
                }}
                placeholder="https://..."
                className="mt-1 w-full rounded-lg border border-line bg-[#070b11] px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-500"
              />
            </label>
          </div>

          <label className="block text-xs text-muted">
            Или загрузить файл (до 320 KB)
            <input
              type="file"
              accept="image/*"
              onChange={(event) => void onImageFileChange(event)}
              className="mt-1 block w-full rounded-lg border border-dashed border-line bg-[#070b11] px-3 py-2 text-xs text-slate-200"
            />
            {selectedFileName ? <span className="mt-1 block text-[11px] text-slate-300">{selectedFileName}</span> : null}
          </label>

          {listingDraft.imageUrl ? (
            <div className="w-fit rounded-lg border border-line bg-[#070b11] p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={listingDraft.imageUrl}
                alt="Превью"
                className="h-20 w-20 rounded object-cover"
              />
            </div>
          ) : null}

          <label className="block text-xs text-muted">
            Описание
            <textarea
              value={listingDraft.description}
              onChange={(event) => setListingDraft((prev) => ({ ...prev, description: event.target.value }))}
              rows={3}
              maxLength={500}
              placeholder="Кратко опишите товар, чары, состояние и условия сделки"
              className="mt-1 w-full rounded-lg border border-line bg-[#070b11] px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-500"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg border border-accent/40 bg-gradient-to-b from-accent to-accentStrong px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {submitting ? "Сохранение..." : editingListingId ? "Сохранить изменения" : "Опубликовать товар"}
            </button>
            <button
              type="button"
              onClick={() => {
                resetEditor();
                setIsEditorOpen(false);
              }}
              className="rounded-lg border border-line px-4 py-2 text-sm text-slate-200 hover:border-slate-500"
            >
              Отмена
            </button>
          </div>
        </form>
      ) : null}

      {loadingListings ? <p className="text-xs text-muted">Обновление списка товаров...</p> : null}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {visibleItems.map((item) => {
          const canManage = Boolean(
            item.listingId &&
              currentUser &&
              (currentUser.role === "ADMIN" || item.ownerName?.toLowerCase() === currentUser.username.toLowerCase())
          );

          return (
            <ProductCard
              key={item.id}
              item={item}
              canManage={canManage}
              onEdit={openEditEditor}
              onDelete={(entry) => {
                void removeListing(entry);
              }}
              onCreateRequest={(payload) => {
                void handleCreateRequest(payload);
              }}
            />
          );
        })}
      </div>

      <section className="space-y-3 pt-2">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="font-display text-lg md:text-xl">Активные заявки на покупку</h2>
            <p className="text-xs text-muted md:text-sm">
              Здесь видно: предмет, кто хочет купить, сколько штук и за сколько аров.
            </p>
          </div>
          <Link
            href="/requests"
            className="rounded-full border border-line px-3 py-1.5 text-xs text-slate-200 transition hover:border-slate-500"
          >
            Открыть полный список
          </Link>
        </div>

        {loadingRequests ? <p className="text-xs text-muted">Обновление заявок...</p> : null}

        <PurchaseRequestsTable
          requests={requests}
          currentUser={currentUser?.username ?? null}
          currentUserRole={currentUser?.role ?? null}
          onTake={(id) => void claimRequest(id).then((x) => setMessage(x.message))}
          onRelease={(id) => void releaseRequest(id).then((x) => setMessage(x.message))}
          onComplete={(id) => void completeRequest(id).then((x) => setMessage(x.message))}
          onCancel={(id) => void cancelRequest(id).then((x) => setMessage(x.message))}
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
