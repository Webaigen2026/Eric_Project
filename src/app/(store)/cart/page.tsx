"use client";

import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { formatPrice } from "@/lib/format";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotalCents, itemCount } =
    useCart();

  if (itemCount === 0) {
    return (
      <div className="page page-narrow">
        <h1 className="page-title">Your cart is empty</h1>
        <p className="lede">Browse the shelf and add bottles to reserve for pickup.</p>
        <Link href="/shop" className="btn btn-primary mt-5">
          Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="page max-w-3xl">
      <h1 className="page-title">Cart</h1>
      <p className="lede">
        These items stay reserved for two hours after the pickup time you
        choose. Pick them up in store and pay at the counter.
      </p>

      <ul className="mt-6 divide-y divide-[var(--line)] border-y border-[var(--line)]">
        {items.map((item) => (
          <li
            key={item.productId}
            className="flex flex-wrap items-center justify-between gap-3 py-3"
          >
            <div className="min-w-0">
              <Link
                href={`/shop/${item.slug}`}
                className="text-[var(--ink)] hover:underline"
              >
                {item.name}
              </Link>
              <p className="text-sm text-[var(--ink-muted)]">
                {formatPrice(item.priceCents)} each
              </p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) =>
                  updateQuantity(
                    item.productId,
                    Math.max(1, Number(e.target.value) || 1)
                  )
                }
                className="field mt-0 w-16"
              />
              <p className="w-16 text-right text-sm">
                {formatPrice(item.priceCents * item.quantity)}
              </p>
              <button
                type="button"
                onClick={() => removeItem(item.productId)}
                className="text-sm text-[var(--ink-muted)] hover:text-[var(--ink)]"
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm">
          Subtotal <span className="text-[var(--ink)]">{formatPrice(subtotalCents)}</span>
        </p>
        <Link href="/checkout" className="btn btn-primary">
          Reserve
        </Link>
      </div>
    </div>
  );
}
