export type MarketCategory =
  | "Баннеры"
  | "Зачарованные книги"
  | "Алмазная броня и инструменты"
  | "Незеритовые вещи";

export interface MarketItem {
  id: string;
  sourceKey: string;
  texture: string;
  token: string;
  name: string;
  category: MarketCategory;
  description: string;
  lotSize: number;
  lotLabel: string;
  unitLabel: string;
  priceAr: number;
}

export interface PurchaseRequest {
  id: string;
  itemId: string;
  itemName: string;
  nickname: string;
  quantity: number;
  offeredPriceAr: number;
  createdAt: string;
}

export interface UserAccount {
  nickname: string;
  password: string;
}
