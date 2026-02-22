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
    description: "Размещение баннера на витрине магазина на 24 часа.",
    lotSize: 1,
    lotLabel: "1 сутки",
    unitLabel: "сутки",
    priceAr: 8
  },
  {
    id: "banner-pattern-flow",
    sourceKey: "flow_banner_pattern",
    texture: "flow_banner_pattern",
    token: "BNR",
    name: "Узор флага: Flow",
    category: "Баннеры",
    description: "Яркий паттерн для рекламы клана или магазина.",
    lotSize: 1,
    lotLabel: "1 шт",
    unitLabel: "шт",
    priceAr: 5
  },
  {
    id: "banner-pattern-flower",
    sourceKey: "flower_banner_pattern",
    texture: "flower_banner_pattern",
    token: "BNR",
    name: "Узор флага: Flower",
    category: "Баннеры",
    description: "Декоративный баннерный узор для торговых точек.",
    lotSize: 1,
    lotLabel: "1 шт",
    unitLabel: "шт",
    priceAr: 5
  },
  {
    id: "banner-pattern-creeper",
    sourceKey: "creeper_banner_pattern",
    texture: "creeper_banner_pattern",
    token: "BNR",
    name: "Узор флага: Creeper",
    category: "Баннеры",
    description: "Популярный PvP-стиль для агрессивных вывесок.",
    lotSize: 1,
    lotLabel: "1 шт",
    unitLabel: "шт",
    priceAr: 5
  },
  {
    id: "book-mending",
    sourceKey: "enchanted_book",
    texture: "enchanted_book",
    token: "BOOK",
    name: "Книга: Починка",
    category: "Зачарованные книги",
    description: "Топ-зачарование для долговечной экипировки.",
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
    description: "Добыча блоков без разрушения исходной формы.",
    lotSize: 1,
    lotLabel: "1 шт",
    unitLabel: "шт",
    priceAr: 6
  },
  {
    id: "book-efficiency",
    sourceKey: "enchanted_book",
    texture: "enchanted_book",
    token: "BOOK",
    name: "Книга: Эффективность",
    category: "Зачарованные книги",
    description: "Ускоряет добычу руды и строительство ферм.",
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
    description: "Надёжное оружие для рейдов и дуэлей.",
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
    description: "Быстрая добыча и база для топ-зачарований.",
    lotSize: 1,
    lotLabel: "1 шт",
    unitLabel: "шт",
    priceAr: 4
  },
  {
    id: "diamond-axe",
    sourceKey: "diamond_axe",
    texture: "diamond_axe",
    token: "DIA",
    name: "Алмазный топор",
    category: "Алмазная броня и инструменты",
    description: "Универсальный инструмент и мощный PvP-слот.",
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
    description: "Элемент комплекта алмазной защиты.",
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
    description: "Основной защитный слот для боевых выходов.",
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
    description: "Часть алмазного сета по рыночной цене.",
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
    description: "Для зачарований на скорость и падение.",
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
    description: "Редкий ресурс для улучшения алмазных предметов.",
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
    description: "Максимальный урон и прочность для эндгейма.",
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
    description: "Топ-инструмент для добычи и фарма ресурсов.",
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
    description: "Часть полного сета незеритовой брони.",
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
    description: "Ключевой слот для максимальной защиты.",
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
    description: "Боевая экипировка высокого класса.",
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
    description: "Финальный элемент незеритового комплекта.",
    lotSize: 1,
    lotLabel: "1 шт",
    unitLabel: "шт",
    priceAr: 18
  }
];

function resolveLotLabel(source: SourceItem, fallback: string) {
  if (!source.trade_label) return fallback;

  if (/\d/.test(source.trade_label)) {
    return source.trade_label;
  }

  const count = Number.isFinite(source.trade_count) && source.trade_count > 0 ? source.trade_count : 1;
  return `${count} ${source.trade_label}`;
}

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

    if (item.id === "banner-rent") {
      return item;
    }

    return {
      ...item,
      priceAr: Number.isFinite(source.price_ars) && source.price_ars > 0 ? source.price_ars : item.priceAr,
      lotSize: Number.isFinite(source.trade_count) && source.trade_count > 0 ? source.trade_count : item.lotSize,
      lotLabel: resolveLotLabel(source, item.lotLabel)
    };
  });
}
