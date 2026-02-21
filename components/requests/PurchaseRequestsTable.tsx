"use client";

import Link from "next/link";
import { CheckCircle2, Handshake, RotateCcw, XCircle } from "lucide-react";
import { PurchaseRequest } from "@/lib/types";

type PurchaseRequestsTableProps = {
  requests: PurchaseRequest[];
  currentUser: string | null;
  onTake?: (requestId: string) => void;
  onRelease?: (requestId: string) => void;
  onComplete?: (requestId: string) => void;
  onCancel?: (requestId: string) => void;
  compact?: boolean;
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function statusBadge(status: PurchaseRequest["status"]) {
  if (status === "OPEN") return "bg-emerald-400/10 text-emerald-300 border-emerald-300/40";
  if (status === "CLAIMED") return "bg-blue-400/10 text-blue-300 border-blue-300/40";
  if (status === "COMPLETED") return "bg-slate-300/10 text-slate-200 border-slate-300/30";
  return "bg-rose-400/10 text-rose-300 border-rose-300/30";
}

function statusLabel(status: PurchaseRequest["status"]) {
  if (status === "OPEN") return "Open";
  if (status === "CLAIMED") return "Taken";
  if (status === "COMPLETED") return "Completed";
  return "Cancelled";
}

export function PurchaseRequestsTable({
  requests,
  currentUser,
  onTake,
  onRelease,
  onComplete,
  onCancel,
  compact = false
}: PurchaseRequestsTableProps) {
  const rows = compact ? requests.slice(0, 8) : requests;
  const current = currentUser?.toLowerCase() ?? null;

  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-panel/95">
      <table className="w-full min-w-[940px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-line text-left text-slate-300">
            <th className="px-3 py-3 font-semibold">Time</th>
            <th className="px-3 py-3 font-semibold">Item</th>
            <th className="px-3 py-3 font-semibold">Player</th>
            <th className="px-3 py-3 font-semibold">Qty</th>
            <th className="px-3 py-3 font-semibold">Price</th>
            <th className="px-3 py-3 font-semibold">Status</th>
            <th className="px-3 py-3 font-semibold">Taken by</th>
            <th className="px-3 py-3 font-semibold">Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((request) => {
              const creator = request.creatorName.toLowerCase();
              const claimer = request.claimerName?.toLowerCase() ?? null;
              const isCreator = Boolean(current && current === creator);
              const isClaimer = Boolean(current && claimer && current === claimer);

              return (
                <tr key={request.id} className="border-b border-line/80 text-slate-200">
                  <td className="px-3 py-3 text-xs text-muted">{formatDate(request.createdAt)}</td>
                  <td className="px-3 py-3 font-semibold">{request.itemName}</td>
                  <td className="px-3 py-3">
                    <Link
                      href={`/profile/${encodeURIComponent(request.creatorName)}`}
                      className="underline-offset-2 hover:text-accent hover:underline"
                    >
                      {request.creatorName}
                    </Link>
                  </td>
                  <td className="px-3 py-3">{request.quantity}</td>
                  <td className="px-3 py-3 font-semibold text-accent">{request.offeredPriceAr} AR</td>
                  <td className="px-3 py-3">
                    <span
                      className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${statusBadge(request.status)}`}
                    >
                      {statusLabel(request.status)}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-xs">
                    {request.claimerName ? (
                      <Link
                        href={`/profile/${encodeURIComponent(request.claimerName)}`}
                        className="underline-offset-2 hover:text-accent hover:underline"
                      >
                        {request.claimerName}
                      </Link>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1">
                      {request.status === "OPEN" && !isCreator ? (
                        <button
                          type="button"
                          onClick={() => onTake?.(request.id)}
                          className="inline-flex items-center gap-1 rounded-md border border-emerald-300/40 px-2 py-1 text-xs text-emerald-300 hover:bg-emerald-400/10"
                        >
                          <Handshake size={12} />
                          Take
                        </button>
                      ) : null}

                      {request.status === "OPEN" && isCreator ? (
                        <button
                          type="button"
                          onClick={() => onCancel?.(request.id)}
                          className="inline-flex items-center gap-1 rounded-md border border-rose-300/40 px-2 py-1 text-xs text-rose-300 hover:bg-rose-400/10"
                        >
                          <XCircle size={12} />
                          Cancel
                        </button>
                      ) : null}

                      {request.status === "CLAIMED" && isClaimer ? (
                        <>
                          <button
                            type="button"
                            onClick={() => onRelease?.(request.id)}
                            className="inline-flex items-center gap-1 rounded-md border border-amber-300/40 px-2 py-1 text-xs text-amber-300 hover:bg-amber-400/10"
                          >
                            <RotateCcw size={12} />
                            Release
                          </button>
                          <button
                            type="button"
                            onClick={() => onComplete?.(request.id)}
                            className="inline-flex items-center gap-1 rounded-md border border-sky-300/40 px-2 py-1 text-xs text-sky-300 hover:bg-sky-400/10"
                          >
                            <CheckCircle2 size={12} />
                            Complete
                          </button>
                        </>
                      ) : null}

                      {request.status === "CLAIMED" && isCreator ? (
                        <button
                          type="button"
                          onClick={() => onComplete?.(request.id)}
                          className="inline-flex items-center gap-1 rounded-md border border-sky-300/40 px-2 py-1 text-xs text-sky-300 hover:bg-sky-400/10"
                        >
                          <CheckCircle2 size={12} />
                          Complete
                        </button>
                      ) : null}

                      {request.status !== "OPEN" && request.status !== "CLAIMED" ? (
                        <span className="text-xs text-muted">Closed</span>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={8} className="px-3 py-8 text-center text-sm text-muted">
                No active requests yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
