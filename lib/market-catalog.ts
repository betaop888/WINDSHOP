import { MarketItem } from "@/lib/types";

export const SOURCE_DATA_URL = "https://betaop888.github.io/wind.github.io/data/items.json";

type SourceItem = {
  key: string;
  name_ru: string;
  price_ars: number;
  trade_count: number;
  trade_label: string;
};

type SourcePayload = {
  currency: string;
  currency_note: string;
  items: SourceItem[];
};

export const BASE_MARKET_ITEMS: MarketItem[] = [
  {
    id: "banner-rent",
    sourceKey: "flow_banner_pattern",
    texture: "flow_banner_pattern",
    token: "ADS",
    name: "Аренда баннера",
    category: "Баннеры",
    description: "Размещение баннера на витрине магазина на 1 сутки.",
    lotSize: 1,
    lotLabel: "1 сутки",
    unitLabel: "сутки",
    priceAr: 8
  },
  {
    id: "banner-white",
    sourceKey: "flower_banner_pattern",
    texture: "flower_banner_pattern",
    token: "BNR",
    name: "Баннер (белый стиль)",
    category: "Баннеры",
    description: "Лот для оформления магазинов и клановых точек.",
    lotSize: 16,
    lotLabel: "16 шт",
    unitLabel: "шт",
    priceAr: 1
  },
  {
    id: "banner-red",
    sourceKey: "creeper_banner_pattern",
    texture: "creeper_banner_pattern",
    token: "BNR",
    name: "Баннер (красный стиль)",
    category: "Баннеры",
    description: "Яркий баннер для вывесок и PvP-лотов.",
    lotSize: 16,
    lotLabel: "16 шт",
    unitLabel: "шт",
    priceAr: 1
  },
  {
    id: "banner-blue",
    sourceKey: "globe_banner_pattern",
    texture: "globe_banner_pattern",
    token: "BNR",
    name: "Баннер (синий стиль)",
    category: "Баннеры",
    description: "Подходит для морской, небесной и техно-стилистики.",
    lotSize: 16,
    lotLabel: "16 шт",
    unitLabel: "шт",
    priceAr: 1
  },
  {
    id: "banner-green",
    sourceKey: "guster_banner_pattern",
    texture: "guster_banner_pattern",
    token: "BNR",
    name: "Баннер (зелёный стиль)",
    category: "Баннеры",
    description: "Часто используют для ферм и природных зон.",
    lotSize: 16,
    lotLabel: "16 шт",
    unitLabel: "шт",
    priceAr: 1
  },
  {
    id: "book-enchanted",
    sourceKey: "enchanted_book",
    texture: "enchanted_book",
    token: "BOOK",
    name: "Зачарованная книга",
    category: "Зачарованные книги",
    description: "Базовая лотовая позиция чар-книг.",
    lotSize: 1,
    lotLabel: "1 шт",
    unitLabel: "шт",
    priceAr: 6
  },
  {
    id: "book-mending",
    sourceKey: "enchanted_book",
    texture: "enchanted_book",
    token: "BOOK",
    name: "Книга: Починка",
    category: "Зачарованные книги",
    description: "Ключевая книга для долгой службы вещей.",
    lotSize: 1,
    lotLabel: "1 шт",
    unitLabel: "шт",
    priceAr: 6
  },
  {
    id: "book-silk-touch",
    sourceKey: "enchanted_book",
    texture: "enchanted_book",
    token: "BOOK",
    name: "Книга: Шёлковое касание",
    category: "Зачарованные книги",
    description: "Для добычи блоков без разрушения формы.",
    lotSize: 1,
    lotLabel: "1 шт",
    unitLabel: "шт",
    priceAr: 6
  },
  {
    id: "diamond-sword",
    sourceKey: "diamond_sword",
    texture: "diamond_sword",
    token: "DIA",
    name: "Алмазный меч",
    category: "Алмазная броня и инструменты",
    description: "Базовое оружие для боёв и рейдов.",
    lotSize: 1,
    lotLabel: "1 шт",
    unitLabel: "шт",
    priceAr: 4
  },
  {
    id: "diamond-pickaxe",
    sourceKey: "diamond_pickaxe",
    texture: "diamond_pickaxe",
    token: "DIA",
    name: "Алмазная кирка",
    category: "Алмазная броня и инструменты",
    description: "Быстрая добыча руды и редких блоков.",
    lotSize: 1,
    lotLabel: "1 шт",
    unitLabel: "шт",
    priceAr: 4
  },
  {
    id: "diamond-helmet",
    sourceKey: "diamond_helmet",
    texture: "diamond_helmet",
    token: "DIA",
    name: "Алмазный шлем",
    category: "Алмазная броня и инструменты",
    description: "Часть алмазного комплекта защиты.",
    lotSize: 1,
    lotLabel: "1 шт",
    unitLabel: "шт",
    priceAr: 4
  },
  {
    id: "diamond-chestplate",
    sourceKey: "diamond_chestplate",
    texture: "diamond_chestplate",
    token: "DIA",
    name: "Алмазный нагрудник",
    category: "Алмазная броня и инструменты",
    description: "Наиболее важный защитный слот алмазки.",
    lotSize: 1,
    lotLabel: "1 шт",
    unitLabel: "шт",
    priceAr: 4
  },
  {
    id: "diamond-leggings",
    sourceKey: "diamond_leggings",
    texture: "diamond_leggings",
    token: "DIA",
    name: "Алмазные поножи",
    category: "Алмазная броня и инструменты",
    description: "Цена и лот по прайсу источника.",
    lotSize: 1,
    lotLabel: "1 шт",
    unitLabel: "шт",
    priceAr: 2
  },
  {
    id: "diamond-boots",
    sourceKey: "diamond_boots",
    texture: "diamond_boots",
    token: "DIA",
    name: "Алмазные ботинки",
    category: "Алмазная броня и инструменты",
    description: "Для чар на падение и скорость.",
    lotSize: 1,
    lotLabel: "1 шт",
    unitLabel: "шт",
    priceAr: 4
  },
  {
    id: "netherite-ingot",
    sourceKey: "netherite_ingot",
    texture: "netherite_ingot",
    token: "NTH",
    name: "Незеритовый слиток",
    category: "Незеритовые вещи",
    description: "Материал для крафта и апгрейда незерита.",
    lotSize: 1,
    lotLabel: "1 шт",
    unitLabel: "шт",
    priceAr: 20
  },
  {
    id: "netherite-sword",
    sourceKey: "netherite_sword",
    texture: "netherite_sword",
    token: "NTH",
    name: "Незеритовый меч",
    category: "Незеритовые вещи",
    description: "Топовый урон и высокая прочность.",
    lotSize: 1,
    lotLabel: "1 шт",
    unitLabel: "шт",
    priceAr: 18
  },
  {
    id: "netherite-pickaxe",
    sourceKey: "netherite_pickaxe",
    texture: "netherite_pickaxe",
    token: "NTH",
    name: "Незеритовая кирка",
    category: "Незеритовые вещи",
    description: "Топ-уровень для быстрой добычи.",
    lotSize: 1,
    lotLabel: "1 шт",
    unitLabel: "шт",
    priceAr: 18
  },
  {
    id: "netherite-helmet",
    sourceKey: "netherite_helmet",
    texture: "netherite_helmet",
    token: "NTH",
    name: "Незеритовый шлем",
    category: "Незеритовые вещи",
    description: "Эндгейм защита для PvP и рейдов.",
    lotSize: 1,
    lotLabel: "1 шт",
    unitLabel: "шт",
    priceAr: 18
  },
  {
    id: "netherite-chestplate",
    sourceKey: "netherite_chestplate",
    texture: "netherite_chestplate",
    token: "NTH",
    name: "Незеритовый нагрудник",
    category: "Незеритовые вещи",
    description: "Ключевая часть незерит-сета.",
    lotSize: 1,
    lotLabel: "1 шт",
    unitLabel: "шт",
    priceAr: 18
  },
  {
    id: "netherite-leggings",
    sourceKey: "netherite_leggings",
    texture: "netherite_leggings",
    token: "NTH",
    name: "Незеритовые поножи",
    category: "Незеритовые вещи",
    description: "Стабильная цена по экономике Wind.",
    lotSize: 1,
    lotLabel: "1 шт",
    unitLabel: "шт",
    priceAr: 12
  },
  {
    id: "netherite-boots",
    sourceKey: "netherite_boots",
    texture: "netherite_boots",
    token: "NTH",
    name: "Незеритовые ботинки",
    category: "Незеритовые вещи",
    description: "Высокая стойкость для опасных вылазок.",
    lotSize: 1,
    lotLabel: "1 шт",
    unitLabel: "шт",
    priceAr: 18
  }
];

export async function fetchSourceItems(): Promise<SourceItem[]> {
  const response = await fetch(SOURCE_DATA_URL, { cache: "no-store" });

  if (!response.ok) {
    throw new Error("Не удалось загрузить цены из источника.");
  }

  const payload = (await response.json()) as SourcePayload;
  return payload.items ?? [];
}

export function mergeItemsWithSource(sourceItems: SourceItem[]): MarketItem[] {
  const byKey = new Map(sourceItems.map((source) => [source.key, source]));

  return BASE_MARKET_ITEMS.map((item) => {
    const source = byKey.get(item.sourceKey);
    if (!source) return item;

    const isDailyBannerRent = item.id === "banner-rent";
    if (isDailyBannerRent) return item;

    return {
      ...item,
      priceAr: Number.isFinite(source.price_ars) ? source.price_ars : item.priceAr,
      lotSize: Number.isFinite(source.trade_count) ? source.trade_count : item.lotSize,
      lotLabel: source.trade_label ? `${source.trade_label}` : item.lotLabel
    };
  });
}
