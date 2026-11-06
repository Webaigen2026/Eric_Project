"use client";

import { useState } from "react";
import { useCart } from "./CartProvider";

type Props = {
  product: {
    id: string;
    slug: string;
    name: string;
    priceCents: number;
    imageUrl?: string | null;
    available: number;
  };
};

export function AddToCartButton({ product }: Props) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  if (product.available <= 0) {
    return (
      <p className="text-sm text-[var(--ink-muted)]">
        Currently unavailable — fully reserved or out of stock.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <label className="label">
        Qty
        <input
          type="number"
          min={1}
          max={product.available}
          value={qty}
          onChange={(e) =>
            setQty(
              Math.min(
                product.available,
                Math.max(1, Number(e.target.value) || 1)
              )
            )
          }
          className="field mt-2 w-20"
        />
      </label>
      <button
        type="button"
        onClick={() => {
          addItem(
            {
              productId: product.id,
              slug: product.slug,
              name: product.name,
              priceCents: product.priceCents,
              imageUrl: product.imageUrl,
            },
            qty
          );
          setAdded(true);
          setTimeout(() => setAdded(false), 2000);
        }}
        className="btn btn-primary min-w-[10rem]"
      >
        {added ? "Added" : "Add to cart"}
      </button>
      <p className="pb-2 text-sm text-[var(--ink-muted)]">
        {product.available} available
      </p>
    </div>
  );
}
