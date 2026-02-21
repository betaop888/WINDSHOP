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

export type RequestStatus = "OPEN" | "CLAIMED" | "COMPLETED" | "CANCELLED";

export interface PurchaseRequest {
  id: string;
  itemId: string;
  itemName: string;
  creatorName: string;
  claimerName: string | null;
  quantity: number;
  offeredPriceAr: number;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AccountProfile {
  username: string;
  bio: string | null;
  createdAt: string;
  stats: {
    createdOpen: number;
    createdTotal: number;
    claimedActive: number;
    completedAsClaimer: number;
  };
}
