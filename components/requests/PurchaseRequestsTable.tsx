"use client";

import { Trash2 } from "lucide-react";
import { PurchaseRequest } from "@/lib/types";

type PurchaseRequestsTableProps = {
  requests: PurchaseRequest[];
  currentUser: string | null;
  onRemoveRequest?: (requestId: string) => void;
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

export function PurchaseRequestsTable({
  requests,
  currentUser,
  onRemoveRequest,
  compact = false
}: PurchaseRequestsTableProps) {
  const rows = compact ? requests.slice(0, 8) : requests;

  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-panel/95">
      <table className="min-w-[760px] w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-line text-left text-slate-300">
            <th className="px-3 py-3 font-semibold">Время</th>
            <th className="px-3 py-3 font-semibold">Предмет</th>
            <th className="px-3 py-3 font-semibold">Ник игрока</th>
            <th className="px-3 py-3 font-semibold">Количество</th>
            <th className="px-3 py-3 font-semibold">Предлагаемая цена</th>
            <th className="px-3 py-3 font-semibold">Действие</th>
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((request) => {
              const canDelete =
                Boolean(currentUser) &&
                currentUser?.toLowerCase() === request.nickname.toLowerCase() &&
                Boolean(onRemoveRequest);

              return (
                <tr key={request.id} className="border-b border-line/80 text-slate-200">
                  <td className="px-3 py-3 text-xs text-muted">{formatDate(request.createdAt)}</td>
                  <td className="px-3 py-3 font-semibold">{request.itemName}</td>
                  <td className="px-3 py-3">{request.nickname}</td>
                  <td className="px-3 py-3">{request.quantity}</td>
                  <td className="px-3 py-3 font-semibold text-accent">{request.offeredPriceAr} ар</td>
                  <td className="px-3 py-3">
                    {canDelete ? (
                      <button
                        type="button"
                        onClick={() => onRemoveRequest?.(request.id)}
                        className="inline-flex items-center gap-1 rounded-md border border-rose-300/40 px-2 py-1 text-xs text-rose-300 hover:bg-rose-400/10"
                      >
                        <Trash2 size={12} />
                        Удалить
                      </button>
                    ) : (
                      <span className="text-xs text-muted">-</span>
                    )}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={6} className="px-3 py-8 text-center text-sm text-muted">
                Активных заявок пока нет.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
