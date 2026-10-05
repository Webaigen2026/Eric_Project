import { prisma } from "@/lib/prisma";
import { getHeldQuantities } from "@/lib/stock";
import { CATEGORIES } from "@/lib/format";
import { ProductCard } from "@/components/ProductCard";
import { ShopSearch } from "@/components/ShopSearch";
import Link from "next/link";

type Props = {
  searchParams: Promise<{ category?: string; q?: string }>;
};

export const metadata = {
  title: "Shop",
};

export default async function ShopPage({ searchParams }: Props) {
  const { category, q } = await searchParams;

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(category && CATEGORIES.includes(category as (typeof CATEGORIES)[number])
        ? { category }
        : {}),
      ...(q
        ? { name: { startsWith: q, mode: "insensitive" } }
        : {}),
    },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  const held = await getHeldQuantities(products.map((p) => p.id));
  const list = products.map((p) => ({
    ...p,
    available: Math.max(0, p.stockOnHand - (held.get(p.id) ?? 0)),
  }));

  return (
    <div className="page">
      <h1 className="page-title">Shop</h1>
      <p className="lede">Select bottles to reserve for in-store pickup.</p>

      <ShopSearch q={q} category={category} />

      <div className="mt-4 flex flex-wrap gap-1 border-b border-[var(--line)]">
        <Link href="/shop" className={!category ? "chip chip-active" : "chip"}>
          All
        </Link>
        {CATEGORIES.map((cat) => (
          <Link
            key={cat}
            href={`/shop?category=${cat}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
            className={category === cat ? "chip chip-active" : "chip"}
          >
            {cat}
          </Link>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="py-12 text-sm text-[var(--ink-muted)]">
          No products match your search.
        </p>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
          {list.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
