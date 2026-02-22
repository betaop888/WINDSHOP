"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PurchaseRequestsTable } from "@/components/requests/PurchaseRequestsTable";
import { useAppState } from "@/components/providers/AppStateProvider";
import { PurchaseRequest } from "@/lib/types";

type RequestsView = "active" | "incoming" | "myCreated" | "myTaken" | "history";

export function RequestsPage() {
  const {
    requests,
    currentUser,
    claimRequest,
    releaseRequest,
    completeRequest,
    cancelRequest,
    refreshRequests
  } = useAppState();

  const [view, setView] = useState<RequestsView>("active");
  const [allRequests, setAllRequests] = useState<PurchaseRequest[]>([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const loadAllRequests = useCallback(async () => {
    try {
      const response = await fetch("/api/requests?status=all");
      const json = (await response.json()) as { requests?: PurchaseRequest[] };
      setAllRequests(json.requests ?? []);
    } catch {
      setAllRequests([]);
    }
  }, []);

  useEffect(() => {
    if (view === "history") {
      void loadAllRequests();
      return;
    }
    void refreshRequests();
  }, [loadAllRequests, refreshRequests, view]);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 2500);
    return () => clearTimeout(timer);
  }, [message]);

  const stats = useMemo(() => {
    const current = currentUser?.username.toLowerCase() ?? "";

    const incoming = requests.filter(
      (request) => request.status === "OPEN" && request.preferredSellerName?.toLowerCase() === current
    ).length;
    const myCreated = requests.filter((request) => request.creatorName.toLowerCase() === current).length;
    const myTaken = requests.filter((request) => request.claimerName?.toLowerCase() === current).length;

    return {
      active: requests.length,
      incoming,
      myCreated,
      myTaken
    };
  }, [currentUser?.username, requests]);

  const sourceRows = useMemo(() => {
    const current = currentUser?.username.toLowerCase() ?? "";

    if (view === "history") return allRequests;
    if (view === "incoming") {
      return requests.filter(
        (request) => request.status === "OPEN" && request.preferredSellerName?.toLowerCase() === current
      );
    }
    if (view === "myCreated") {
      return requests.filter((request) => request.creatorName.toLowerCase() === current);
    }
    if (view === "myTaken") {
      return requests.filter((request) => request.claimerName?.toLowerCase() === current);
    }

    return requests;
  }, [allRequests, currentUser?.username, requests, view]);

  const visibleRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return sourceRows;

    return sourceRows.filter((request) => {
      const stack = [
        request.itemName,
        request.creatorName,
        request.claimerName || "",
        request.preferredSellerName || ""
      ]
        .join(" ")
        .toLowerCase();

      return stack.includes(query);
    });
  }, [search, sourceRows]);

  const titleByView: Record<RequestsView, string> = {
    active: "Все активные заявки",
    incoming: "Входящие покупки для меня",
    myCreated: "Мои созданные заявки",
    myTaken: "Заявки, которые я взял",
    history: "История заявок"
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-xl md:text-2xl">Заявки на покупку</h1>
          <p className="mt-1 text-sm text-muted">
            Продуманная доска: фильтры по ролям, поиск и быстрые действия.
          </p>
        </div>

        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Поиск: предмет, покупатель, продавец"
          className="w-full max-w-sm rounded-full border border-line bg-panel px-4 py-2 text-sm text-slate-100 outline-none focus:border-slate-500"
        />
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-xl border border-line bg-panel/95 p-3">
          <p className="text-xs text-muted">Активных</p>
          <p className="mt-1 text-xl font-bold text-slate-100">{stats.active}</p>
        </article>
        <article className="rounded-xl border border-line bg-panel/95 p-3">
          <p className="text-xs text-muted">Входящие продажи</p>
          <p className="mt-1 text-xl font-bold text-accent">{stats.incoming}</p>
        </article>
        <article className="rounded-xl border border-line bg-panel/95 p-3">
          <p className="text-xs text-muted">Создано мной</p>
          <p className="mt-1 text-xl font-bold text-emerald-300">{stats.myCreated}</p>
        </article>
        <article className="rounded-xl border border-line bg-panel/95 p-3">
          <p className="text-xs text-muted">Взято мной</p>
          <p className="mt-1 text-xl font-bold text-sky-300">{stats.myTaken}</p>
        </article>
      </div>

      <div className="flex flex-wrap gap-2 rounded-2xl border border-line bg-panel/95 p-2 text-xs">
        {([
          ["active", "Активные"],
          ["incoming", "Входящие"],
          ["myCreated", "Мои заявки"],
          ["myTaken", "В работе у меня"],
          ["history", "История"]
        ] as Array<[RequestsView, string]>).map(([entryView, label]) => (
          <button
            key={entryView}
            type="button"
            onClick={() => setView(entryView)}
            className={`rounded-full px-3 py-1.5 ${
              view === entryView ? "bg-accent/15 text-accent" : "text-muted hover:text-slate-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div>
        <h2 className="text-sm font-semibold text-slate-200">{titleByView[view]}</h2>
        <p className="mt-1 text-xs text-muted">Найдено: {visibleRows.length}</p>
      </div>

      <PurchaseRequestsTable
        requests={visibleRows}
        currentUser={currentUser?.username ?? null}
        currentUserRole={currentUser?.role ?? null}
        onTake={(id) =>
          void claimRequest(id).then((x) => {
            setMessage(x.message);
            if (view === "history") void loadAllRequests();
          })
        }
        onRelease={(id) =>
          void releaseRequest(id).then((x) => {
            setMessage(x.message);
            if (view === "history") void loadAllRequests();
          })
        }
        onComplete={(id) =>
          void completeRequest(id).then((x) => {
            setMessage(x.message);
            if (view === "history") void loadAllRequests();
          })
        }
        onCancel={(id) =>
          void cancelRequest(id).then((x) => {
            setMessage(x.message);
            if (view === "history") void loadAllRequests();
          })
        }
      />

      {message ? (
        <div className="fixed bottom-4 right-4 z-50 rounded-xl border border-line bg-[#0d131e] px-4 py-2 text-sm text-slate-100 shadow-card">
          {message}
        </div>
      ) : null}
    </section>
  );
}
