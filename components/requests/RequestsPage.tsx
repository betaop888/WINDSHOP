"use client";

import { PurchaseRequestsTable } from "@/components/requests/PurchaseRequestsTable";
import { useAppState } from "@/components/providers/AppStateProvider";

export function RequestsPage() {
  const { requests, currentUser, removeRequest } = useAppState();

  return (
    <section className="space-y-4">
      <div>
        <h1 className="font-display text-xl md:text-2xl">Активные заявки на покупку</h1>
        <p className="mt-1 text-sm text-muted">
          Таблица показывает: предмет, ник игрока, количество и предлагаемую цену в арах.
        </p>
      </div>

      <PurchaseRequestsTable
        requests={requests}
        currentUser={currentUser}
        onRemoveRequest={removeRequest}
      />
    </section>
  );
}
