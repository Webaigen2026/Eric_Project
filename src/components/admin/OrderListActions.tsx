"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const LIST_ACTIONS: Record<
  string,
  { label: string; next: string; primary?: boolean }[]
> = {
  pending: [
    { label: "Ready", next: "ready", primary: true },
    { label: "Picked up", next: "picked_up", primary: true },
    { label: "Cancel", next: "cancelled" },
    { label: "Expire", next: "expired" },
  ],
  ready: [
    { label: "Picked up", next: "picked_up", primary: true },
    { label: "Cancel", next: "cancelled" },
    { label: "Expire", next: "expired" },
  ],
  expired: [
    { label: "Picked up", next: "picked_up", primary: true },
    { label: "Ready", next: "ready" },
    { label: "Cancel", next: "cancelled" },
  ],
  cancelled: [
    { label: "Picked up", next: "picked_up", primary: true },
    { label: "Ready", next: "ready" },
  ],
  picked_up: [],
};

export function OrderListActions({
  orderId,
  status,
}: {
  orderId: string;
  status: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const actions = LIST_ACTIONS[status] ?? [];

  if (actions.length === 0) return null;

  async function setStatus(next: string) {
    setLoading(next);
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setLoading(null);
    if (!res.ok) return;
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {actions.map((a) => (
        <button
          key={a.next}
          type="button"
          disabled={loading !== null}
          onClick={() => setStatus(a.next)}
          className={`btn !px-2.5 !py-1 !text-xs ${
            a.primary ? "btn-primary" : "btn-quiet"
          }`}
        >
          {loading === a.next ? "Saving…" : a.label}
        </button>
      ))}
    </div>
  );
}
