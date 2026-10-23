import Link from "next/link";
import { formatPrice } from "@/lib/format";

type Props = {
  product: {
    name: string;
    slug: string;
    category: string;
    priceCents: number;
    imageUrl?: string | null;
    available: number;
  };
};

export function ProductCard({ product }: Props) {
  const outOfStock = product.available <= 0;

  return (
    <Link
      href={`/shop/${product.slug}`}
      className="product-card group block overflow-hidden rounded-2xl border-[3px] border-[#d0d0d0] bg-[var(--cream-card)] hover:border-white"
    >
      <div className="relative aspect-square overflow-hidden rounded-t-[0.85rem] border-b-[3px] border-[#d0d0d0] bg-white">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full rounded-t-[0.7rem] object-cover"
          />
        ) : (
          <div className="flex h-full items-end p-3">
            <span className="text-sm font-semibold text-[#555555]">
              {product.category}
            </span>
          </div>
        )}
        {outOfStock ? (
          <span className="absolute left-2 top-2 rounded-md bg-black/80 px-2 py-1 text-sm font-semibold text-[var(--ink-muted)]">
            Unavailable
          </span>
        ) : null}
      </div>
      <div className="px-3 py-3">
        <p className="text-sm font-semibold text-[var(--ink-muted)]">{product.category}</p>
        <h3 className="mt-0.5 truncate text-xl font-semibold text-[var(--ink)]">
          {product.name}
        </h3>
        <p className="mt-1 text-lg font-semibold text-[var(--ink)]">
          {formatPrice(product.priceCents)}
        </p>
      </div>
    </Link>
  );
}
