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
      className="product-card group block transition-transform duration-300 hover:-translate-y-1"
    >
      <div className="product-media relative aspect-[4/5] shadow-[0_10px_30px_rgba(0,0,0,0.28)]">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-end p-4">
            <span className="text-sm font-medium text-[#666666]">
              {product.category}
            </span>
          </div>
        )}
        {outOfStock ? (
          <span className="absolute left-3 top-3 bg-[#0b0a08]/90 px-2.5 py-1 text-xs font-semibold tracking-wide text-[var(--ink)]">
            Sold out
          </span>
        ) : null}
      </div>
      <div className="pt-4">
        <p className="kicker !tracking-[0.12em] text-[0.72rem]">
          {product.category}
        </p>
        <h3 className="mt-1.5 truncate text-[1.05rem] font-semibold text-[var(--ink)]">
          {product.name}
        </h3>
        <p className="mt-1.5 text-[0.95rem] text-[var(--amber)]">
          {formatPrice(product.priceCents)}
        </p>
      </div>
    </Link>
  );
}
