"use client";

import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Flag,
  Handshake,
  RotateCcw,
  ShieldCheck,
  ShieldX,
  Truck,
  XCircle
} from "lucide-react";
import { PurchaseRequest, UserRole } from "@/lib/types";

type PurchaseRequestsTableProps = {
  requests: PurchaseRequest[];
  currentUser: string | null;
  currentUserRole?: UserRole | null;
  onTake?: (requestId: string) => void;
  onRelease?: (requestId: string) => void;
  onMarkDelivered?: (requestId: string) => void;
  onConfirmReceipt?: (requestId: string) => void;
  onOpenDispute?: (requestId: string, reason: string) => void;
  onResolveComplete?: (requestId: string) => void;
  onResolveCancel?: (requestId: string) => void;
  onCancel?: (requestId: string) => void;
  compact?: boolean;
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function statusBadge(status: PurchaseRequest["status"]) {
  if (status === "OPEN") return "bg-emerald-400/10 text-emerald-300 border-emerald-300/40";
  if (status === "CLAIMED") return "bg-blue-400/10 text-blue-300 border-blue-300/40";
  if (status === "AWAITING_BUYER_CONFIRM") {
    return "bg-amber-400/10 text-amber-300 border-amber-300/40";
  }
  if (status === "DISPUTED") return "bg-rose-400/10 text-rose-300 border-rose-300/40";
  if (status === "COMPLETED") return "bg-slate-300/10 text-slate-200 border-slate-300/30";
  return "bg-zinc-300/10 text-zinc-300 border-zinc-300/30";
}

function statusLabel(status: PurchaseRequest["status"]) {
  if (status === "OPEN") return "Открыта";
  if (status === "CLAIMED") return "В работе";
  if (status === "AWAITING_BUYER_CONFIRM") return "Ожидает подтверждения";
  if (status === "DISPUTED") return "Спор";
  if (status === "COMPLETED") return "Завершена";
  return "Отменена";
}

function resolveProgress(status: PurchaseRequest["status"]) {
  if (status === "OPEN") return 20;
  if (status === "CLAIMED") return 45;
  if (status === "AWAITING_BUYER_CONFIRM") return 70;
  if (status === "DISPUTED") return 60;
  if (status === "COMPLETED") return 100;
  return 100;
}

function askDisputeReason() {
  const reason = window.prompt("Укажите причину спора (минимум 3 символа):", "");
  if (reason === null) return null;
  const cleaned = reason.trim();
  if (cleaned.length < 3) return "";
  return cleaned;
}

export function PurchaseRequestsTable({
  requests,
  currentUser,
  currentUserRole,
  onTake,
  onRelease,
  onMarkDelivered,
  onConfirmReceipt,
  onOpenDispute,
  onResolveComplete,
  onResolveCancel,
  onCancel,
  compact = false
}: PurchaseRequestsTableProps) {
  const rows = compact ? requests.slice(0, 8) : requests;
  const current = currentUser?.toLowerCase() ?? null;
  const isAdmin = currentUserRole === "ADMIN";

  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-panel/95">
      <table className="w-full min-w-[1280px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-line text-left text-slate-300">
            <th className="px-3 py-3 font-semibold">Время</th>
            <th className="px-3 py-3 font-semibold">Предмет</th>
            <th className="px-3 py-3 font-semibold">Покупатель</th>
            <th className="px-3 py-3 font-semibold">Кол-во</th>
            <th className="px-3 py-3 font-semibold">Цена</th>
            <th className="px-3 py-3 font-semibold">Этап сделки</th>
            <th className="px-3 py-3 font-semibold">Назначен продавец</th>
            <th className="px-3 py-3 font-semibold">Исполнитель</th>
            <th className="px-3 py-3 font-semibold">Системные отметки</th>
            <th className="px-3 py-3 font-semibold">Действия</th>
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((request) => {
              const creator = request.creatorName.toLowerCase();
              const claimer = request.claimerName?.toLowerCase() ?? null;
              const preferredSeller = request.preferredSellerName?.toLowerCase() ?? null;

              const isCreator = Boolean(current && current === creator);
              const isClaimer = Boolean(current && claimer && current === claimer);
              const isPreferredSeller = Boolean(current && preferredSeller && current === preferredSeller);

              const canTake =
                request.status === "OPEN" &&
                !isCreator &&
                (!request.preferredSellerName || isPreferredSeller || isAdmin);

              const canCancel = request.status === "OPEN" && (isCreator || isAdmin);
              const canRelease = request.status === "CLAIMED" && (isClaimer || isAdmin);
              const canMarkDelivered = request.status === "CLAIMED" && (isClaimer || isAdmin);
              const canConfirmReceipt =
                request.status === "AWAITING_BUYER_CONFIRM" && (isCreator || isAdmin);

              const canOpenDispute =
                (request.status === "CLAIMED" || request.status === "AWAITING_BUYER_CONFIRM") &&
                (isCreator || isClaimer || isAdmin);

              const canResolveDispute = request.status === "DISPUTED" && isAdmin;

              const showPreferredInfo =
                !canTake &&
                request.status === "OPEN" &&
                Boolean(request.preferredSellerName) &&
                !isCreator &&
                !isAdmin;

              return (
                <tr key={request.id} className="border-b border-line/80 text-slate-200 align-top">
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
                  <td className="px-3 py-3 font-semibold text-accent">{request.offeredPriceAr} ар</td>
                  <td className="px-3 py-3">
                    <div className="space-y-2">
                      <span
                        className={`inline-flex rounded-full border px-2 py-1 text-[11px] font-semibold ${statusBadge(request.status)}`}
                      >
                        {statusLabel(request.status)}
                      </span>
                      <div className="h-1.5 w-44 overflow-hidden rounded-full bg-[#131b2a]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-accent to-[#9cd3ff]"
                          style={{ width: `${resolveProgress(request.status)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-xs">
                    {request.preferredSellerName ? (
                      <Link
                        href={`/profile/${encodeURIComponent(request.preferredSellerName)}`}
                        className="underline-offset-2 hover:text-accent hover:underline"
                      >
                        {request.preferredSellerName}
                      </Link>
                    ) : (
                      <span className="text-muted">Любой продавец</span>
                    )}
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
                  <td className="px-3 py-3 text-xs text-muted">
                    {request.sellerConfirmedAt ? (
                      <p>Сдал: {formatDate(request.sellerConfirmedAt)}</p>
                    ) : (
                      <p>Сдал: -</p>
                    )}
                    {request.buyerConfirmedAt ? (
                      <p>Подтв.: {formatDate(request.buyerConfirmedAt)}</p>
                    ) : (
                      <p>Подтв.: -</p>
                    )}
                    {request.disputeComment ? (
                      <p className="line-clamp-2 text-rose-300">Спор: {request.disputeComment}</p>
                    ) : null}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1">
                      {canTake ? (
                        <button
                          type="button"
                          onClick={() => onTake?.(request.id)}
                          className="inline-flex items-center gap-1 rounded-md border border-emerald-300/40 px-2 py-1 text-xs text-emerald-300 hover:bg-emerald-400/10"
                        >
                          <Handshake size={12} />
                          Взяться
                        </button>
                      ) : null}

                      {canCancel ? (
                        <button
                          type="button"
                          onClick={() => onCancel?.(request.id)}
                          className="inline-flex items-center gap-1 rounded-md border border-rose-300/40 px-2 py-1 text-xs text-rose-300 hover:bg-rose-400/10"
                        >
                          <XCircle size={12} />
                          Отменить
                        </button>
                      ) : null}

                      {canRelease ? (
                        <button
                          type="button"
                          onClick={() => onRelease?.(request.id)}
                          className="inline-flex items-center gap-1 rounded-md border border-amber-300/40 px-2 py-1 text-xs text-amber-300 hover:bg-amber-400/10"
                        >
                          <RotateCcw size={12} />
                          Вернуть
                        </button>
                      ) : null}

                      {canMarkDelivered ? (
                        <button
                          type="button"
                          onClick={() => onMarkDelivered?.(request.id)}
                          className="inline-flex items-center gap-1 rounded-md border border-cyan-300/40 px-2 py-1 text-xs text-cyan-300 hover:bg-cyan-400/10"
                        >
                          <Truck size={12} />
                          Сдал товар
                        </button>
                      ) : null}

                      {canConfirmReceipt ? (
                        <button
                          type="button"
                          onClick={() => onConfirmReceipt?.(request.id)}
                          className="inline-flex items-center gap-1 rounded-md border border-sky-300/40 px-2 py-1 text-xs text-sky-300 hover:bg-sky-400/10"
                        >
                          <CheckCircle2 size={12} />
                          Подтвердить
                        </button>
                      ) : null}

                      {canOpenDispute ? (
                        <button
                          type="button"
                          onClick={() => {
                            const reason = askDisputeReason();
                            if (reason === null) return;
                            if (!reason) {
                              window.alert("Причина должна быть минимум 3 символа.");
                              return;
                            }
                            onOpenDispute?.(request.id, reason);
                          }}
                          className="inline-flex items-center gap-1 rounded-md border border-rose-300/40 px-2 py-1 text-xs text-rose-300 hover:bg-rose-400/10"
                        >
                          <Flag size={12} />
                          Открыть спор
                        </button>
                      ) : null}

                      {canResolveDispute ? (
                        <>
                          <button
                            type="button"
                            onClick={() => onResolveComplete?.(request.id)}
                            className="inline-flex items-center gap-1 rounded-md border border-emerald-300/40 px-2 py-1 text-xs text-emerald-300 hover:bg-emerald-400/10"
                          >
                            <ShieldCheck size={12} />
                            Завершить
                          </button>
                          <button
                            type="button"
                            onClick={() => onResolveCancel?.(request.id)}
                            className="inline-flex items-center gap-1 rounded-md border border-rose-300/40 px-2 py-1 text-xs text-rose-300 hover:bg-rose-400/10"
                          >
                            <ShieldX size={12} />
                            Отменить
                          </button>
                        </>
                      ) : null}

                      {showPreferredInfo ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-muted">
                          <AlertTriangle size={11} />
                          Только для продавца {request.preferredSellerName}
                        </span>
                      ) : null}

                      {!canTake &&
                      !canCancel &&
                      !canRelease &&
                      !canMarkDelivered &&
                      !canConfirmReceipt &&
                      !canOpenDispute &&
                      !canResolveDispute &&
                      !showPreferredInfo ? (
                        <span className="text-xs text-muted">-</span>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={10} className="px-3 py-8 text-center text-sm text-muted">
                Заявок пока нет.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
