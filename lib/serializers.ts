import { Listing, PurchaseRequest, RequestStatus, Review } from "@/lib/types";

type DbRequest = {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  offeredPriceAr: number;
  status: RequestStatus;
  sellerConfirmedAt: Date | null;
  buyerConfirmedAt: Date | null;
  disputedAt: Date | null;
  disputeComment: string | null;
  createdAt: Date;
  updatedAt: Date;
  creator: { username: string };
  claimer: { username: string } | null;
  preferredSeller: { username: string } | null;
};

type DbListing = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  priceAr: number;
  category: string;
  createdAt: Date;
  updatedAt: Date;
  owner: { username: string; displayName: string | null };
};

type DbReview = {
  id: string;
  rating: number;
  comment: string;
  createdAt: Date;
  author: { username: string; displayName: string | null };
};

export function serializePurchaseRequest(request: DbRequest): PurchaseRequest {
  return {
    id: request.id,
    itemId: request.itemId,
    itemName: request.itemName,
    creatorName: request.creator.username,
    claimerName: request.claimer?.username ?? null,
    preferredSellerName: request.preferredSeller?.username ?? null,
    quantity: request.quantity,
    offeredPriceAr: request.offeredPriceAr,
    status: request.status,
    sellerConfirmedAt: request.sellerConfirmedAt ? request.sellerConfirmedAt.toISOString() : null,
    buyerConfirmedAt: request.buyerConfirmedAt ? request.buyerConfirmedAt.toISOString() : null,
    disputedAt: request.disputedAt ? request.disputedAt.toISOString() : null,
    disputeComment: request.disputeComment,
    createdAt: request.createdAt.toISOString(),
    updatedAt: request.updatedAt.toISOString()
  };
}

export function serializeListing(listing: DbListing): Listing {
  return {
    id: listing.id,
    title: listing.title,
    description: listing.description,
    imageUrl: listing.imageUrl,
    priceAr: listing.priceAr,
    category: listing.category,
    ownerName: listing.owner.username,
    ownerDisplayName: listing.owner.displayName ?? null,
    createdAt: listing.createdAt.toISOString(),
    updatedAt: listing.updatedAt.toISOString()
  };
}

export function serializeReview(review: DbReview): Review {
  return {
    id: review.id,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt.toISOString(),
    authorName: review.author.username,
    authorDisplayName: review.author.displayName ?? null
  };
}
