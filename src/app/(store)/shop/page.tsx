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
      <div className="max-w-2xl">
        <p className="kicker">Catalog</p>
        <h1 className="page-title mt-2">Shop</h1>
        <p className="lede">
          Browse the shelf, reserve what you want, and pick it up in store.
        </p>
      </div>

      <div className="mt-10">
        <ShopSearch q={q} category={category} />
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-2 border-b border-[var(--line)] pb-5">
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
        <p className="py-16 text-base text-[var(--ink-muted)]">
          No products match your search.
        </p>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
          {list.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
