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
import { PurchaseRequest } from "@/lib/types";

type AuthResult = { ok: boolean; message: string };

type AddRequestInput = {
  itemId: string;
  itemName: string;
  quantity: number;
  offeredPriceAr: number;
};

type SessionUser = {
  username: string;
  bio: string | null;
};

type AppStateContextType = {
  hydrated: boolean;
  loadingRequests: boolean;
  currentUser: SessionUser | null;
  requests: PurchaseRequest[];
  login: (username: string, password: string) => Promise<AuthResult>;
  register: (
    username: string,
    password: string,
    repeatPassword: string
  ) => Promise<AuthResult>;
  logout: () => Promise<void>;
  addRequest: (input: AddRequestInput) => Promise<AuthResult>;
  claimRequest: (requestId: string) => Promise<AuthResult>;
  releaseRequest: (requestId: string) => Promise<AuthResult>;
  completeRequest: (requestId: string) => Promise<AuthResult>;
  cancelRequest: (requestId: string) => Promise<AuthResult>;
  refreshRequests: () => Promise<void>;
  updateMyBio: (bio: string) => Promise<AuthResult>;
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
  const message = maybeMessage || (response.ok ? "OK" : "Request failed.");

  return {
    ok: response.ok,
    data: json as T,
    message
  };
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);

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

  useEffect(() => {
    void (async () => {
      await Promise.all([refreshSession(), refreshRequests()]);
      setHydrated(true);
    })();
  }, [refreshRequests, refreshSession]);

  useEffect(() => {
    if (!hydrated) return;

    const timer = setInterval(() => {
      void refreshRequests();
    }, REQUESTS_POLL_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [hydrated, refreshRequests]);

  const login = useCallback(async (username: string, password: string): Promise<AuthResult> => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const parsed = await parseResponse<{ user?: SessionUser }>(response);
    if (!parsed.ok) return { ok: false, message: parsed.message };

    setCurrentUser(parsed.data.user ?? null);
    await refreshRequests();
    return { ok: true, message: "Logged in successfully." };
  }, [refreshRequests]);

  const register = useCallback(
    async (username: string, password: string, repeatPassword: string): Promise<AuthResult> => {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, repeatPassword })
      });

      const parsed = await parseResponse<{ user?: SessionUser }>(response);
      if (!parsed.ok) return { ok: false, message: parsed.message };

      setCurrentUser(parsed.data.user ?? null);
      await refreshRequests();
      return { ok: true, message: "Account created successfully." };
    },
    [refreshRequests]
  );

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setCurrentUser(null);
    await refreshRequests();
  }, [refreshRequests]);

  const addRequest = useCallback(
    async (input: AddRequestInput): Promise<AuthResult> => {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input)
      });

      const parsed = await parseResponse<{ request?: PurchaseRequest }>(response);
      if (!parsed.ok) return { ok: false, message: parsed.message };

      await refreshRequests();
      return { ok: true, message: "Purchase request created." };
    },
    [refreshRequests]
  );

  const claimRequest = useCallback(
    async (requestId: string): Promise<AuthResult> => {
      const response = await fetch(`/api/requests/${requestId}/claim`, {
        method: "POST"
      });
      const parsed = await parseResponse<{ request?: PurchaseRequest }>(response);
      if (!parsed.ok) return { ok: false, message: parsed.message };

      await refreshRequests();
      return { ok: true, message: "Request taken." };
    },
    [refreshRequests]
  );

  const releaseRequest = useCallback(
    async (requestId: string): Promise<AuthResult> => {
      const response = await fetch(`/api/requests/${requestId}/release`, {
        method: "POST"
      });
      const parsed = await parseResponse<{ request?: PurchaseRequest }>(response);
      if (!parsed.ok) return { ok: false, message: parsed.message };

      await refreshRequests();
      return { ok: true, message: "Request released back to market." };
    },
    [refreshRequests]
  );

  const completeRequest = useCallback(
    async (requestId: string): Promise<AuthResult> => {
      const response = await fetch(`/api/requests/${requestId}/complete`, {
        method: "POST"
      });
      const parsed = await parseResponse<{ request?: PurchaseRequest }>(response);
      if (!parsed.ok) return { ok: false, message: parsed.message };

      await refreshRequests();
      return { ok: true, message: "Request marked as completed." };
    },
    [refreshRequests]
  );

  const cancelRequest = useCallback(
    async (requestId: string): Promise<AuthResult> => {
      const response = await fetch(`/api/requests/${requestId}/cancel`, {
        method: "POST"
      });
      const parsed = await parseResponse<{ request?: PurchaseRequest }>(response);
      if (!parsed.ok) return { ok: false, message: parsed.message };

      await refreshRequests();
      return { ok: true, message: "Request cancelled." };
    },
    [refreshRequests]
  );

  const updateMyBio = useCallback(async (bio: string): Promise<AuthResult> => {
    const response = await fetch("/api/profiles/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bio })
    });

    const parsed = await parseResponse<{ profile?: SessionUser }>(response);
    if (!parsed.ok) return { ok: false, message: parsed.message };

    if (parsed.data.profile) {
      setCurrentUser((prev) => (prev ? { ...prev, bio: parsed.data.profile?.bio ?? null } : prev));
    }

    return { ok: true, message: "Profile updated." };
  }, []);

  const value = useMemo<AppStateContextType>(
    () => ({
      hydrated,
      loadingRequests,
      currentUser,
      requests,
      login,
      register,
      logout,
      addRequest,
      claimRequest,
      releaseRequest,
      completeRequest,
      cancelRequest,
      refreshRequests,
      updateMyBio
    }),
    [
      hydrated,
      loadingRequests,
      currentUser,
      requests,
      login,
      register,
      logout,
      addRequest,
      claimRequest,
      releaseRequest,
      completeRequest,
      cancelRequest,
      refreshRequests,
      updateMyBio
    ]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error("useAppState must be used inside AppStateProvider");
  }
  return context;
}
