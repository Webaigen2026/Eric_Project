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
        <p className="kicker">Cart</p>
        <h1 className="page-title mt-2">Your cart is empty</h1>
        <p className="lede">Browse the shelf and reserve bottles for pickup.</p>
        <Link href="/shop" className="btn btn-primary mt-8">
          Shop the shelf
        </Link>
      </div>
    );
  }

  return (
    <div className="page max-w-3xl">
      <p className="kicker">Cart</p>
      <h1 className="page-title mt-2">Your reservation</h1>
      <p className="lede">
        Items stay reserved for two hours after the pickup time you choose.
        Pay at the counter when you arrive.
      </p>

      <ul className="mt-10 divide-y divide-[var(--line)] border-y border-[var(--line)]">
        {items.map((item) => (
          <li
            key={item.productId}
            className="flex flex-wrap items-center gap-4 py-5"
          >
            <div className="product-media h-20 w-20 shrink-0 overflow-hidden rounded-lg">
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.imageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-[#f4f4f4]" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <Link
                href={`/shop/${item.slug}`}
                className="text-[var(--ink)] hover:underline"
              >
                {item.name}
              </Link>
              <p className="mt-1 text-sm text-[var(--ink-muted)]">
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
                aria-label={`Quantity for ${item.name}`}
              />
              <p className="w-20 text-right text-sm text-[var(--ink)]">
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

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <p className="text-base">
          Subtotal{" "}
          <span className="font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
            {formatPrice(subtotalCents)}
          </span>
        </p>
        <Link href="/checkout" className="btn btn-primary">
          Continue to pickup
        </Link>
      </div>
    </div>
  );
}
