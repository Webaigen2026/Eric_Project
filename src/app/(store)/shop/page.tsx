import { prisma } from "@/lib/prisma";
import { getHeldQuantities } from "@/lib/stock";
import { CATEGORIES } from "@/lib/format";
import { ProductCard } from "@/components/ProductCard";
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
        ? {
            OR: [
              { name: { contains: q } },
              { description: { contains: q } },
            ],
          }
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

      <form className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center" method="get">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search"
          className="field mt-0 sm:max-w-sm"
        />
        {category ? <input type="hidden" name="category" value={category} /> : null}
        <button type="submit" className="btn btn-quiet">
          Search
        </button>
      </form>

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
