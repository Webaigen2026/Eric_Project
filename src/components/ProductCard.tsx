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
      className="group block border border-[var(--line)] bg-[var(--cream-card)] hover:border-[#4a453e]"
    >
      <div className="relative aspect-square overflow-hidden bg-[#161616]">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-end p-3">
            <span className="text-xs text-[var(--ink-muted)]">
              {product.category}
            </span>
          </div>
        )}
        {outOfStock ? (
          <span className="absolute left-2 top-2 bg-black/80 px-1.5 py-0.5 text-xs text-[var(--ink-muted)]">
            Unavailable
          </span>
        ) : null}
      </div>
      <div className="px-3 py-3">
        <p className="text-xs text-[var(--ink-muted)]">{product.category}</p>
        <h3 className="mt-0.5 truncate text-[0.95rem] text-[var(--ink)]">
          {product.name}
        </h3>
        <p className="mt-1 text-sm text-[var(--ink-muted)]">
          {formatPrice(product.priceCents)}
        </p>
      </div>
    </Link>
  );
}
