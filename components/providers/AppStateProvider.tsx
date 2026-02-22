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
import { Listing, PurchaseRequest, SessionUser } from "@/lib/types";

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
  startDiscordAuth: () => void;
  logout: () => Promise<void>;
  addRequest: (input: AddRequestInput) => Promise<ActionResult>;
  claimRequest: (requestId: string) => Promise<ActionResult>;
  releaseRequest: (requestId: string) => Promise<ActionResult>;
  completeRequest: (requestId: string) => Promise<ActionResult>;
  cancelRequest: (requestId: string) => Promise<ActionResult>;
  refreshRequests: () => Promise<void>;
  refreshListings: () => Promise<void>;
  createListing: (input: ListingInput) => Promise<ActionResult>;
  updateListing: (listingId: string, input: ListingInput) => Promise<ActionResult>;
  deleteListing: (listingId: string) => Promise<ActionResult>;
  updateMyBio: (bio: string) => Promise<ActionResult>;
  setUserBan: (username: string, ban: boolean, reason: string) => Promise<ActionResult>;
};

const AppStateContext = createContext<AppStateContextType | null>(null);

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

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [loadingListings, setLoadingListings] = useState(false);
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);

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

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setCurrentUser(null);
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
      return { ok: true, message: "Заявка на покупку создана." };
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

  const completeRequest = useCallback(
    async (requestId: string): Promise<ActionResult> => {
      const response = await fetch(`/api/requests/${requestId}/complete`, {
        method: "POST"
      });
      const parsed = await parseResponse<{ request?: PurchaseRequest }>(response);
      if (!parsed.ok) return { ok: false, message: parsed.message };

      await refreshRequests();
      return { ok: true, message: "Сделка отмечена как успешная." };
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

  const value = useMemo<AppStateContextType>(
    () => ({
      hydrated,
      loadingRequests,
      loadingListings,
      currentUser,
      requests,
      listings,
      startDiscordAuth,
      logout,
      addRequest,
      claimRequest,
      releaseRequest,
      completeRequest,
      cancelRequest,
      refreshRequests,
      refreshListings,
      createListing,
      updateListing,
      deleteListing,
      updateMyBio,
      setUserBan
    }),
    [
      hydrated,
      loadingRequests,
      loadingListings,
      currentUser,
      requests,
      listings,
      startDiscordAuth,
      logout,
      addRequest,
      claimRequest,
      releaseRequest,
      completeRequest,
      cancelRequest,
      refreshRequests,
      refreshListings,
      createListing,
      updateListing,
      deleteListing,
      updateMyBio,
      setUserBan
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
