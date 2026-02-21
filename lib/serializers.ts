import { PurchaseRequest, RequestStatus } from "@/lib/types";

type DbRequest = {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  offeredPriceAr: number;
  status: RequestStatus;
  createdAt: Date;
  updatedAt: Date;
  creator: { username: string };
  claimer: { username: string } | null;
};

export function serializePurchaseRequest(request: DbRequest): PurchaseRequest {
  return {
    id: request.id,
    itemId: request.itemId,
    itemName: request.itemName,
    creatorName: request.creator.username,
    claimerName: request.claimer?.username ?? null,
    quantity: request.quantity,
    offeredPriceAr: request.offeredPriceAr,
    status: request.status,
    createdAt: request.createdAt.toISOString(),
    updatedAt: request.updatedAt.toISOString()
  };
}
