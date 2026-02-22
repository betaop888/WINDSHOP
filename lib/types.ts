export type MarketCategory =
  | "Баннеры"
  | "Зачарованные книги"
  | "Алмазная броня и инструменты"
  | "Незеритовые вещи"
  | "Пользовательские товары";

export const MARKET_CATEGORIES: MarketCategory[] = [
  "Баннеры",
  "Зачарованные книги",
  "Алмазная броня и инструменты",
  "Незеритовые вещи",
  "Пользовательские товары"
];

export interface MarketItem {
  id: string;
  sourceKey: string;
  texture?: string;
  imageUrl?: string;
  token: string;
  name: string;
  category: MarketCategory;
  description: string;
  lotSize: number;
  lotLabel: string;
  unitLabel: string;
  priceAr: number;
  listingId?: string;
  ownerName?: string;
}

export interface CartItem {
  key: string;
  itemId: string;
  itemName: string;
  listingId?: string;
  ownerName?: string;
  imageUrl?: string;
  texture?: string;
  token: string;
  lotSize: number;
  lotLabel: string;
  quantity: number;
  priceAr: number;
}

export type RequestStatus =
  | "OPEN"
  | "CLAIMED"
  | "AWAITING_BUYER_CONFIRM"
  | "DISPUTED"
  | "COMPLETED"
  | "CANCELLED";
export type UserRole = "USER" | "ADMIN";

export interface PurchaseRequest {
  id: string;
  itemId: string;
  itemName: string;
  creatorName: string;
  claimerName: string | null;
  preferredSellerName: string | null;
  quantity: number;
  offeredPriceAr: number;
  status: RequestStatus;
  sellerConfirmedAt: string | null;
  buyerConfirmedAt: string | null;
  disputedAt: string | null;
  disputeComment: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  priceAr: number;
  category: string;
  ownerName: string;
  ownerDisplayName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SessionUser {
  username: string;
  displayName: string | null;
  bio: string | null;
  role: UserRole;
  isBanned?: boolean;
  banReason?: string | null;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  authorName: string;
  authorDisplayName: string | null;
}

export interface AccountProfile {
  username: string;
  displayName: string | null;
  bio: string | null;
  role: UserRole;
  isBanned: boolean;
  banReason: string | null;
  createdAt: string;
  stats: {
    createdOpen: number;
    createdTotal: number;
    claimedActive: number;
    completedAsClaimer: number;
    completedSales: number;
    successfulDealsTotal: number;
  };
}
