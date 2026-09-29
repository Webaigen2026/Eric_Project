"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCart } from "@/components/CartProvider";
import { ReserveNotice } from "@/components/ReserveNotice";
import { formatPrice } from "@/lib/format";

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, subtotalCents, clearCart, itemCount } = useCart();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (itemCount === 0) {
    return (
      <div className="page page-narrow">
        <h1 className="page-title">Nothing to reserve</h1>
        <Link href="/shop" className="mt-4 inline-block text-sm text-[var(--ink-muted)] hover:text-[var(--ink)]">
          Return to shop
        </Link>
      </div>
    );
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const pickupLocal = String(form.get("preferredPickupAt") || "");
    let preferredPickupAt: string | null = null;
    if (pickupLocal) {
      preferredPickupAt = new Date(pickupLocal).toISOString();
    }

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.get("customerName"),
          phone: form.get("phone"),
          email: form.get("email"),
          notes: form.get("notes") || "",
          preferredPickupAt,
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not reserve these items");
        setLoading(false);
        return;
      }

      clearCart();
      router.push(`/order/${data.order.orderNumber}`);
    } catch {
      setError("Network error — please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="page page-narrow">
      <h1 className="page-title">Reserve for pickup</h1>
      <p className="lede">
        Reserving as {session?.user?.name}. This is not an online purchase.
      </p>
      <div className="mt-5">
        <ReserveNotice />
      </div>

      <ul className="mt-5 space-y-1 border-y border-[var(--line)] py-3 text-sm text-[var(--ink-muted)]">
        {items.map((i) => (
          <li key={i.productId} className="flex justify-between gap-3">
            <span>
              {i.quantity}× {i.name}
            </span>
            <span>{formatPrice(i.priceCents * i.quantity)}</span>
          </li>
        ))}
        <li className="flex justify-between gap-3 pt-2 text-[var(--ink)]">
          <span>Due at pickup</span>
          <span>{formatPrice(subtotalCents)}</span>
        </li>
      </ul>

      <form onSubmit={onSubmit} className="mt-5 space-y-3">
        <label className="label">
          Full name
          <input
            required
            name="customerName"
            defaultValue={session?.user?.name ?? ""}
            className="field"
          />
        </label>
        <label className="label">
          Phone
          <input
            required
            name="phone"
            type="tel"
            defaultValue={session?.user?.phone ?? ""}
            className="field"
          />
        </label>
        <label className="label">
          Email
          <input
            required
            name="email"
            type="email"
            defaultValue={session?.user?.email ?? ""}
            className="field"
          />
        </label>
        <label className="label">
          Pickup time
          <input
            required
            name="preferredPickupAt"
            type="datetime-local"
            className="field"
          />
          <span className="mt-1 block text-sm text-[var(--ink-muted)]">
            The reservation lasts two hours after this time.
          </span>
        </label>
        <label className="label">
          Notes
          <textarea
            name="notes"
            rows={3}
            className="field"
            placeholder="Optional"
          />
        </label>

        {error ? <p className="form-error">{error}</p> : null}

        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? "Reserving…" : "Reserve"}
        </button>
      </form>
    </div>
  );
}
