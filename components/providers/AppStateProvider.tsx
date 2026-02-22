"use client";

import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import { REQUESTS_POLL_INTERVAL_MS } from "@/lib/constants";
import { CartItem, Listing, MarketItem, PurchaseRequest, SessionUser } from "@/lib/types";

type ActionResult = { ok: boolean; message: string };

type AddRequestInput = {
  itemId: string;
  itemName: string;
  listingId?: string;
  quantity: number;
  offeredPriceAr: number;
};

type ListingInput = {
  title: string;
  description: string;
  imageUrl: string;
  priceAr: number;
  category: string;
};

type AppStateContextType = {
  hydrated: boolean;
  loadingRequests: boolean;
  loadingListings: boolean;
  currentUser: SessionUser | null;
  requests: PurchaseRequest[];
  listings: Listing[];
  cartItems: CartItem[];
  startDiscordAuth: () => void;
  logout: () => Promise<void>;
  addRequest: (input: AddRequestInput) => Promise<ActionResult>;
  claimRequest: (requestId: string) => Promise<ActionResult>;
  releaseRequest: (requestId: string) => Promise<ActionResult>;
  markDeliveredRequest: (requestId: string) => Promise<ActionResult>;
  completeRequest: (requestId: string) => Promise<ActionResult>;
  openDisputeRequest: (requestId: string, reason: string) => Promise<ActionResult>;
  resolveDisputeRequest: (
    requestId: string,
    decision: "complete" | "cancel"
  ) => Promise<ActionResult>;
  cancelRequest: (requestId: string) => Promise<ActionResult>;
  refreshRequests: () => Promise<void>;
  refreshListings: () => Promise<void>;
  createListing: (input: ListingInput) => Promise<ActionResult>;
  updateListing: (listingId: string, input: ListingInput) => Promise<ActionResult>;
  deleteListing: (listingId: string) => Promise<ActionResult>;
  updateMyBio: (bio: string) => Promise<ActionResult>;
  setUserBan: (username: string, ban: boolean, reason: string) => Promise<ActionResult>;
  addToCart: (item: MarketItem, quantity: number) => ActionResult;
  updateCartItemQuantity: (itemKey: string, quantity: number) => void;
  removeCartItem: (itemKey: string) => void;
  clearCart: () => void;
  confirmCartItem: (itemKey: string) => Promise<ActionResult>;
  checkoutCart: () => Promise<ActionResult>;
};

const AppStateContext = createContext<AppStateContextType | null>(null);
const CART_STORAGE_PREFIX = "wind_cart_v2";

async function parseResponse<T>(response: Response): Promise<{ ok: boolean; data: T; message: string }> {
  let json: unknown = {};
  try {
    json = await response.json();
  } catch {
    json = {};
  }

  const maybeMessage = (json as { message?: string })?.message;
  return {
    ok: response.ok,
    data: json as T,
    message: maybeMessage || (response.ok ? "OK" : "Ошибка запроса")
  };
}

function cartStorageKey(username: string) {
  return `${CART_STORAGE_PREFIX}:${username.toLowerCase()}`;
}

function getCartItemKey(item: MarketItem) {
  return item.listingId ? `listing:${item.listingId}` : `item:${item.id}`;
}

function marketItemToCartItem(item: MarketItem, quantity: number): CartItem {
  return {
    key: getCartItemKey(item),
    itemId: item.id,
    itemName: item.name,
    listingId: item.listingId,
    ownerName: item.ownerName,
    imageUrl: item.imageUrl,
    texture: item.texture,
    token: item.token,
    lotSize: item.lotSize,
    lotLabel: item.lotLabel,
    quantity,
    priceAr: item.priceAr
  };
}

function safeParseCart(raw: string): CartItem[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((entry) => entry as CartItem)
      .filter(
        (entry) =>
          typeof entry?.key === "string" &&
          typeof entry?.itemId === "string" &&
          typeof entry?.itemName === "string" &&
          Number.isInteger(entry?.quantity) &&
          entry.quantity > 0 &&
          Number.isInteger(entry?.priceAr) &&
          entry.priceAr > 0 &&
          Number.isInteger(entry?.lotSize) &&
          entry.lotSize > 0
      );
  } catch {
    return [];
  }
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [loadingListings, setLoadingListings] = useState(false);
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const currentUsername = currentUser?.username ?? null;

  const startDiscordAuth = useCallback(() => {
    window.location.href = "/api/auth/discord";
  }, []);

  const refreshSession = useCallback(async () => {
    const response = await fetch("/api/auth/me", { method: "GET" });
    const parsed = await parseResponse<{ user: SessionUser | null }>(response);
    setCurrentUser(parsed.data.user ?? null);
  }, []);

  const refreshRequests = useCallback(async () => {
    setLoadingRequests(true);
    try {
      const response = await fetch("/api/requests?status=active", { method: "GET" });
      const parsed = await parseResponse<{ requests: PurchaseRequest[] }>(response);
      if (parsed.ok) {
        setRequests(parsed.data.requests ?? []);
      }
    } finally {
      setLoadingRequests(false);
    }
  }, []);

  const refreshListings = useCallback(async () => {
    setLoadingListings(true);
    try {
      const response = await fetch("/api/listings", { method: "GET" });
      const parsed = await parseResponse<{ listings: Listing[] }>(response);
      if (parsed.ok) {
        setListings(parsed.data.listings ?? []);
      }
    } finally {
      setLoadingListings(false);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      await Promise.all([refreshSession(), refreshRequests(), refreshListings()]);
      setHydrated(true);
    })();
  }, [refreshListings, refreshRequests, refreshSession]);

  useEffect(() => {
    if (!hydrated) return;

    const timer = setInterval(() => {
      void refreshRequests();
      void refreshListings();
    }, REQUESTS_POLL_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [hydrated, refreshListings, refreshRequests]);

  useEffect(() => {
    if (!currentUsername) {
      setCartItems([]);
      return;
    }

    const key = cartStorageKey(currentUsername);
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      setCartItems([]);
      return;
    }

    setCartItems(safeParseCart(raw));
  }, [currentUsername]);

  useEffect(() => {
    if (!currentUsername) return;
    const key = cartStorageKey(currentUsername);
    window.localStorage.setItem(key, JSON.stringify(cartItems));
  }, [cartItems, currentUsername]);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setCurrentUser(null);
    setCartItems([]);
    await Promise.all([refreshRequests(), refreshListings()]);
  }, [refreshListings, refreshRequests]);

  const addRequest = useCallback(
    async (input: AddRequestInput): Promise<ActionResult> => {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input)
      });

      const parsed = await parseResponse<{ request?: PurchaseRequest }>(response);
      if (!parsed.ok) return { ok: false, message: parsed.message };

      await refreshRequests();
      return { ok: true, message: "Покупка подтверждена. Заявка отправлена." };
    },
    [refreshRequests]
  );

  const claimRequest = useCallback(
    async (requestId: string): Promise<ActionResult> => {
      const response = await fetch(`/api/requests/${requestId}/claim`, {
        method: "POST"
      });
      const parsed = await parseResponse<{ request?: PurchaseRequest }>(response);
      if (!parsed.ok) return { ok: false, message: parsed.message };

      await refreshRequests();
      return { ok: true, message: "Вы взяли заявку в работу." };
    },
    [refreshRequests]
  );

  const releaseRequest = useCallback(
    async (requestId: string): Promise<ActionResult> => {
      const response = await fetch(`/api/requests/${requestId}/release`, {
        method: "POST"
      });
      const parsed = await parseResponse<{ request?: PurchaseRequest }>(response);
      if (!parsed.ok) return { ok: false, message: parsed.message };

      await refreshRequests();
      return { ok: true, message: "Заявка возвращена в общий список." };
    },
    [refreshRequests]
  );

  const markDeliveredRequest = useCallback(
    async (requestId: string): Promise<ActionResult> => {
      const response = await fetch(`/api/requests/${requestId}/mark-delivered`, {
        method: "POST"
      });
      const parsed = await parseResponse<{ request?: PurchaseRequest }>(response);
      if (!parsed.ok) return { ok: false, message: parsed.message };

      await refreshRequests();
      return { ok: true, message: "Отмечено: товар сдан. Ожидаем подтверждение покупателя." };
    },
    [refreshRequests]
  );

  const completeRequest = useCallback(
    async (requestId: string): Promise<ActionResult> => {
      const response = await fetch(`/api/requests/${requestId}/complete`, {
        method: "POST"
      });
      const parsed = await parseResponse<{ request?: PurchaseRequest }>(response);
      if (!parsed.ok) return { ok: false, message: parsed.message };

      await refreshRequests();
      return { ok: true, message: "Покупатель подтвердил получение. Сделка завершена." };
    },
    [refreshRequests]
  );

  const openDisputeRequest = useCallback(
    async (requestId: string, reason: string): Promise<ActionResult> => {
      const response = await fetch(`/api/requests/${requestId}/dispute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason })
      });
      const parsed = await parseResponse<{ request?: PurchaseRequest }>(response);
      if (!parsed.ok) return { ok: false, message: parsed.message };

      await refreshRequests();
      return { ok: true, message: "Спор открыт. Ожидается решение администратора." };
    },
    [refreshRequests]
  );

  const resolveDisputeRequest = useCallback(
    async (requestId: string, decision: "complete" | "cancel"): Promise<ActionResult> => {
      const response = await fetch(`/api/requests/${requestId}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision })
      });
      const parsed = await parseResponse<{ request?: PurchaseRequest }>(response);
      if (!parsed.ok) return { ok: false, message: parsed.message };

      await refreshRequests();
      return {
        ok: true,
        message:
          decision === "complete"
            ? "Спор решён: сделка подтверждена."
            : "Спор решён: сделка отменена."
      };
    },
    [refreshRequests]
  );

  const cancelRequest = useCallback(
    async (requestId: string): Promise<ActionResult> => {
      const response = await fetch(`/api/requests/${requestId}/cancel`, {
        method: "POST"
      });
      const parsed = await parseResponse<{ request?: PurchaseRequest }>(response);
      if (!parsed.ok) return { ok: false, message: parsed.message };

      await refreshRequests();
      return { ok: true, message: "Заявка отменена." };
    },
    [refreshRequests]
  );

  const createListing = useCallback(
    async (input: ListingInput): Promise<ActionResult> => {
      const response = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input)
      });
      const parsed = await parseResponse<{ listing?: Listing }>(response);
      if (!parsed.ok) return { ok: false, message: parsed.message };

      await refreshListings();
      return { ok: true, message: "Товар добавлен в маркетплейс." };
    },
    [refreshListings]
  );

  const updateListing = useCallback(
    async (listingId: string, input: ListingInput): Promise<ActionResult> => {
      const response = await fetch(`/api/listings/${listingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input)
      });
      const parsed = await parseResponse<{ listing?: Listing }>(response);
      if (!parsed.ok) return { ok: false, message: parsed.message };

      await refreshListings();
      return { ok: true, message: "Товар обновлён." };
    },
    [refreshListings]
  );

  const deleteListing = useCallback(
    async (listingId: string): Promise<ActionResult> => {
      const response = await fetch(`/api/listings/${listingId}`, {
        method: "DELETE"
      });
      const parsed = await parseResponse<{ ok?: boolean }>(response);
      if (!parsed.ok) return { ok: false, message: parsed.message };

      await refreshListings();
      return { ok: true, message: "Товар удалён." };
    },
    [refreshListings]
  );

  const updateMyBio = useCallback(async (bio: string): Promise<ActionResult> => {
    const response = await fetch("/api/profiles/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bio })
    });

    const parsed = await parseResponse<{ profile?: SessionUser }>(response);
    if (!parsed.ok) return { ok: false, message: parsed.message };

    if (parsed.data.profile) {
      setCurrentUser(parsed.data.profile);
    }

    return { ok: true, message: "Профиль обновлён." };
  }, []);

  const setUserBan = useCallback(
    async (username: string, ban: boolean, reason: string): Promise<ActionResult> => {
      const response = await fetch(`/api/admin/users/${encodeURIComponent(username)}/ban`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ban, reason })
      });
      const parsed = await parseResponse<{ user?: unknown }>(response);
      if (!parsed.ok) return { ok: false, message: parsed.message };

      await refreshRequests();
      return {
        ok: true,
        message: ban ? "Пользователь заблокирован." : "Блокировка снята."
      };
    },
    [refreshRequests]
  );

  const addToCart = useCallback(
    (item: MarketItem, quantity: number): ActionResult => {
      if (!currentUser) {
        return { ok: false, message: "Сначала войдите через Discord." };
      }

      if (!Number.isInteger(quantity) || quantity <= 0) {
        return { ok: false, message: "Количество должно быть больше 0." };
      }

      const nextItem = marketItemToCartItem(item, quantity);
      setCartItems((prev) => {
        const existing = prev.find((entry) => entry.key === nextItem.key);
        if (!existing) {
          return [...prev, nextItem];
        }

        return prev.map((entry) =>
          entry.key === nextItem.key
            ? {
                ...entry,
                quantity: entry.quantity + quantity
              }
            : entry
        );
      });

      return { ok: true, message: "Товар добавлен в корзину." };
    },
    [currentUser]
  );

  const updateCartItemQuantity = useCallback((itemKey: string, quantity: number) => {
    const safeQuantity = Number.isInteger(quantity) && quantity > 0 ? quantity : 1;

    setCartItems((prev) =>
      prev.map((entry) => (entry.key === itemKey ? { ...entry, quantity: safeQuantity } : entry))
    );
  }, []);

  const removeCartItem = useCallback((itemKey: string) => {
    setCartItems((prev) => prev.filter((entry) => entry.key !== itemKey));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const submitRequestFromCartItem = useCallback(
    async (item: CartItem): Promise<ActionResult> => {
      return addRequest({
        itemId: item.itemId,
        itemName: item.itemName,
        listingId: item.listingId,
        quantity: item.quantity * item.lotSize,
        offeredPriceAr: item.quantity * item.priceAr
      });
    },
    [addRequest]
  );

  const confirmCartItem = useCallback(
    async (itemKey: string): Promise<ActionResult> => {
      const item = cartItems.find((entry) => entry.key === itemKey);
      if (!item) return { ok: false, message: "Товар не найден в корзине." };

      const result = await submitRequestFromCartItem(item);
      if (!result.ok) return result;

      setCartItems((prev) => prev.filter((entry) => entry.key !== itemKey));
      return { ok: true, message: "Покупка подтверждена. Продавец получил уведомление." };
    },
    [cartItems, submitRequestFromCartItem]
  );

  const checkoutCart = useCallback(async (): Promise<ActionResult> => {
    if (!cartItems.length) {
      return { ok: false, message: "Корзина пуста." };
    }

    let success = 0;
    let failed = 0;
    const successfulKeys: string[] = [];
    let firstError = "";

    for (const item of cartItems) {
      const result = await submitRequestFromCartItem(item);
      if (result.ok) {
        success += 1;
        successfulKeys.push(item.key);
      } else {
        failed += 1;
        if (!firstError) firstError = result.message;
      }
    }

    if (successfulKeys.length) {
      setCartItems((prev) => prev.filter((entry) => !successfulKeys.includes(entry.key)));
    }

    if (!success) {
      return { ok: false, message: firstError || "Не удалось подтвердить покупки." };
    }

    if (failed) {
      return {
        ok: true,
        message: `Подтверждено ${success}, с ошибкой ${failed}. ${firstError}`
      };
    }

    return { ok: true, message: `Подтверждено покупок: ${success}. Продавцы получили уведомления.` };
  }, [cartItems, submitRequestFromCartItem]);

  const value = useMemo<AppStateContextType>(
    () => ({
      hydrated,
      loadingRequests,
      loadingListings,
      currentUser,
      requests,
      listings,
      cartItems,
      startDiscordAuth,
      logout,
      addRequest,
      claimRequest,
      releaseRequest,
      markDeliveredRequest,
      completeRequest,
      openDisputeRequest,
      resolveDisputeRequest,
      cancelRequest,
      refreshRequests,
      refreshListings,
      createListing,
      updateListing,
      deleteListing,
      updateMyBio,
      setUserBan,
      addToCart,
      updateCartItemQuantity,
      removeCartItem,
      clearCart,
      confirmCartItem,
      checkoutCart
    }),
    [
      hydrated,
      loadingRequests,
      loadingListings,
      currentUser,
      requests,
      listings,
      cartItems,
      startDiscordAuth,
      logout,
      addRequest,
      claimRequest,
      releaseRequest,
      markDeliveredRequest,
      completeRequest,
      openDisputeRequest,
      resolveDisputeRequest,
      cancelRequest,
      refreshRequests,
      refreshListings,
      createListing,
      updateListing,
      deleteListing,
      updateMyBio,
      setUserBan,
      addToCart,
      updateCartItemQuantity,
      removeCartItem,
      clearCart,
      confirmCartItem,
      checkoutCart
    ]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error("useAppState должен использоваться внутри AppStateProvider");
  }
  return context;
}
