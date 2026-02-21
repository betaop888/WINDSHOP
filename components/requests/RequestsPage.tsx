"use client";

import { useCallback, useEffect, useState } from "react";
import { PurchaseRequestsTable } from "@/components/requests/PurchaseRequestsTable";
import { useAppState } from "@/components/providers/AppStateProvider";
import { PurchaseRequest } from "@/lib/types";

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
  const [mode, setMode] = useState<"active" | "all">("active");
  const [allRequests, setAllRequests] = useState<PurchaseRequest[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const loadAllRequests = useCallback(async () => {
    try {
      const response = await fetch("/api/requests?status=all");
      const json = await response.json();
      setAllRequests(json?.requests ?? []);
    } catch {
      setAllRequests([]);
    }
  }, []);

  useEffect(() => {
    if (mode === "active") {
      void refreshRequests();
      return;
    }
    void loadAllRequests();
  }, [loadAllRequests, mode, refreshRequests]);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 2500);
    return () => clearTimeout(timer);
  }, [message]);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-xl md:text-2xl">Active Purchase Requests</h1>
          <p className="mt-1 text-sm text-muted">
            Everyone sees the same live list. Use <span className="font-semibold text-slate-200">Take</span> to claim
            a request.
          </p>
        </div>

        <div className="inline-flex rounded-full border border-line bg-panel p-1 text-xs">
          <button
            type="button"
            onClick={() => setMode("active")}
            className={`rounded-full px-3 py-1 ${mode === "active" ? "bg-accent/15 text-accent" : "text-muted"}`}
          >
            Active
          </button>
          <button
            type="button"
            onClick={() => setMode("all")}
            className={`rounded-full px-3 py-1 ${mode === "all" ? "bg-accent/15 text-accent" : "text-muted"}`}
          >
            All
          </button>
        </div>
      </div>

      <PurchaseRequestsTable
        requests={mode === "active" ? requests : allRequests}
        currentUser={currentUser?.username ?? null}
        onTake={(id) =>
          void claimRequest(id).then((x) => {
            setMessage(x.message);
            if (mode === "all") void loadAllRequests();
          })
        }
        onRelease={(id) =>
          void releaseRequest(id).then((x) => {
            setMessage(x.message);
            if (mode === "all") void loadAllRequests();
          })
        }
        onComplete={(id) =>
          void completeRequest(id).then((x) => {
            setMessage(x.message);
            if (mode === "all") void loadAllRequests();
          })
        }
        onCancel={(id) =>
          void cancelRequest(id).then((x) => {
            setMessage(x.message);
            if (mode === "all") void loadAllRequests();
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
