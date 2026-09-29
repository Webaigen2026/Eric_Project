"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { formatPrice, formatDateTime, statusLabel } from "@/lib/format";

type OrderItem = {
  id: string;
  quantity: number;
  unitPriceCents: number;
  product: { name: string; slug: string };
};

type Order = {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  email: string;
  notes: string;
  preferredPickupAt: string | null;
  expiresAt?: string | null;
  status: string;
  createdAt: string;
  customerId?: string | null;
  items: OrderItem[];
};

const ACTIONS: Record<string, { label: string; next: string }[]> = {
  pending: [
    { label: "Mark ready", next: "ready" },
    { label: "Cancel reservation", next: "cancelled" },
  ],
  ready: [
    { label: "Mark picked up", next: "picked_up" },
    { label: "Back to reserved", next: "pending" },
    { label: "Cancel reservation", next: "cancelled" },
  ],
  picked_up: [],
  cancelled: [],
  expired: [],
};

export function OrderActions({ order }: { order: Order }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const actions = ACTIONS[order.status] ?? [];

  async function setStatus(status: string) {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Update failed");
      return;
    }
    router.refresh();
  }

  const total = order.items.reduce(
    (n, i) => n + i.unitPriceCents * i.quantity,
    0
  );

  return (
    <div>
      <Link
        href="/admin/orders"
        className="text-sm text-[var(--forest)] hover:underline"
      >
        Orders
      </Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="page-title">
            {order.orderNumber}
          </h1>
          <p className="mt-2 text-[var(--ink-muted)]">
            {statusLabel(order.status)} · placed{" "}
            {formatDateTime(order.createdAt)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {actions.map((a) => (
            <button
              key={a.next}
              type="button"
              disabled={loading}
              onClick={() => setStatus(a.next)}
              className={`btn ${
                a.next === "cancelled"
                  ? "btn-quiet !text-[#e7b4b4]"
                  : a.next === "ready" || a.next === "picked_up"
                    ? "btn-primary"
                    : "btn-quiet"
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <p className="mt-4 text-sm text-red-700">{error}</p>
      ) : null}

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="border border-[var(--line)] bg-[#141414] p-5 text-sm">
          <h2 className="font-semibold">Customer</h2>
          {order.customerId ? (
            <p className="mt-2 inline-block bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-900">
              Registered account
            </p>
          ) : (
            <p className="mt-2 inline-block bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-600">
              Guest hold
            </p>
          )}
          <p className="mt-3">{order.customerName}</p>
          <p className="text-[var(--ink-muted)]">{order.phone}</p>
          <p className="text-[var(--ink-muted)]">{order.email}</p>
          <p className="mt-4">
            <span className="text-[var(--ink-muted)]">Reservation ends:</span>
            <br />
            {formatDateTime(order.expiresAt)}
          </p>
          <p className="mt-4">
            <span className="text-[var(--ink-muted)]">Preferred pickup:</span>
            <br />
            {formatDateTime(order.preferredPickupAt)}
          </p>
          {order.notes ? (
            <p className="mt-4">
              <span className="text-[var(--ink-muted)]">Notes:</span>
              <br />
              {order.notes}
            </p>
          ) : null}
        </div>
        <div className="border border-[var(--line)] bg-[#141414] p-5">
          <h2 className="font-semibold">Items</h2>
          <ul className="mt-3 divide-y divide-[var(--line)] text-sm">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between py-2">
                <span>
                  {item.quantity}× {item.product.name}
                </span>
                <span>
                  {formatPrice(item.unitPriceCents * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-right font-semibold">
            Total: {formatPrice(total)}
          </p>
        </div>
      </div>
    </div>
  );
}
