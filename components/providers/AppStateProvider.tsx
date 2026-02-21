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
import { STORAGE_KEYS } from "@/lib/constants";
import { PurchaseRequest, UserAccount } from "@/lib/types";

type AuthResult = { ok: boolean; message: string };

type AddRequestInput = {
  itemId: string;
  itemName: string;
  quantity: number;
  offeredPriceAr: number;
};

type AppStateContextType = {
  hydrated: boolean;
  currentUser: string | null;
  requests: PurchaseRequest[];
  login: (nickname: string, password: string) => AuthResult;
  register: (nickname: string, password: string, repeatPassword: string) => AuthResult;
  logout: () => void;
  addRequest: (input: AddRequestInput) => AuthResult;
  removeRequest: (requestId: string) => void;
};

const AppStateContext = createContext<AppStateContextType | null>(null);

function parseStorageArray<T>(value: string | null, fallback: T[]): T[] {
  if (!value) return fallback;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as T[]) : fallback;
  } catch {
    return fallback;
  }
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    const storedUsers = parseStorageArray<UserAccount>(localStorage.getItem(STORAGE_KEYS.users), []);
    const storedRequests = parseStorageArray<PurchaseRequest>(
      localStorage.getItem(STORAGE_KEYS.requests),
      []
    );
    const storedSession = localStorage.getItem(STORAGE_KEYS.session);

    setUsers(storedUsers);
    setRequests(storedRequests);
    setCurrentUser(storedSession || null);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
  }, [hydrated, users]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEYS.requests, JSON.stringify(requests));
  }, [hydrated, requests]);

  useEffect(() => {
    if (!hydrated) return;
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.session, currentUser);
      return;
    }
    localStorage.removeItem(STORAGE_KEYS.session);
  }, [currentUser, hydrated]);

  const login = useCallback(
    (nickname: string, password: string): AuthResult => {
      const cleanNickname = nickname.trim();
      const found = users.find(
        (user) =>
          user.nickname.toLowerCase() === cleanNickname.toLowerCase() && user.password === password
      );

      if (!found) {
        return { ok: false, message: "Неверный ник или пароль." };
      }

      setCurrentUser(found.nickname);
      return { ok: true, message: `Вход выполнен: ${found.nickname}` };
    },
    [users]
  );

  const register = useCallback(
    (nickname: string, password: string, repeatPassword: string): AuthResult => {
      const cleanNickname = nickname.trim();

      if (cleanNickname.length < 3) {
        return { ok: false, message: "Ник должен быть не короче 3 символов." };
      }
      if (password.length < 4) {
        return { ok: false, message: "Пароль должен быть не короче 4 символов." };
      }
      if (password !== repeatPassword) {
        return { ok: false, message: "Пароли не совпадают." };
      }

      const alreadyExists = users.some(
        (user) => user.nickname.toLowerCase() === cleanNickname.toLowerCase()
      );
      if (alreadyExists) {
        return { ok: false, message: "Этот ник уже зарегистрирован." };
      }

      const nextUsers = [...users, { nickname: cleanNickname, password }];
      setUsers(nextUsers);
      setCurrentUser(cleanNickname);
      return { ok: true, message: `Аккаунт создан: ${cleanNickname}` };
    },
    [users]
  );

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const addRequest = useCallback(
    (input: AddRequestInput): AuthResult => {
      if (!currentUser) {
        return { ok: false, message: "Для создания заявки нужно войти в аккаунт." };
      }

      if (input.quantity <= 0 || !Number.isFinite(input.quantity)) {
        return { ok: false, message: "Количество должно быть больше 0." };
      }

      const payload: PurchaseRequest = {
        id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
        itemId: input.itemId,
        itemName: input.itemName,
        nickname: currentUser,
        quantity: input.quantity,
        offeredPriceAr: input.offeredPriceAr,
        createdAt: new Date().toISOString()
      };

      setRequests((prev) => [payload, ...prev]);
      return { ok: true, message: "Заявка на покупку создана." };
    },
    [currentUser]
  );

  const removeRequest = useCallback(
    (requestId: string) => {
      setRequests((prev) =>
        prev.filter((request) => {
          if (request.id !== requestId) return true;
          return request.nickname !== currentUser;
        })
      );
    },
    [currentUser]
  );

  const value = useMemo<AppStateContextType>(
    () => ({
      hydrated,
      currentUser,
      requests,
      login,
      register,
      logout,
      addRequest,
      removeRequest
    }),
    [addRequest, currentUser, hydrated, login, logout, register, removeRequest, requests]
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
