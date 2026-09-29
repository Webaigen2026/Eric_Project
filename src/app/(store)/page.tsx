import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getHeldQuantities } from "@/lib/stock";
import { ProductCard } from "@/components/ProductCard";

export default async function HomePage() {
  const [settings, products] = await Promise.all([
    prisma.storeSettings.findUnique({ where: { id: "default" } }),
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      take: 4,
    }),
  ]);

  const store = settings ?? {
    storeName: "Da liquor-store",
    tagline: "Fine spirits, local pickup",
    address: "69 Drug Runner Ave Gotham",
    phone: "420-697-6969",
    hours: "Mon–Thu 10am–9pm\nFri–Sat 10am–11pm\nSun 12pm–7pm",
  };

  const held = await getHeldQuantities(products.map((p) => p.id));
  const featured = products.map((p) => ({
    ...p,
    available: Math.max(0, p.stockOnHand - (held.get(p.id) ?? 0)),
  }));

  return (
    <>
      <section className="border-b border-[var(--line)]">
        <div className="page !pb-8">
          <p className="kicker">{store.address}</p>
          <h1 className="page-title mt-2 text-3xl md:text-4xl">{store.storeName}</h1>
          <p className="lede">
            {store.tagline}. Choose a pickup time. The reservation lasts two
            hours after that, and you pay when you pick the bottles up. Nothing
            is sold online.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/shop" className="btn btn-primary">
              Shop
            </Link>
            <a href="#pickup" className="btn btn-quiet">
              Pickup info
            </a>
          </div>
        </div>
      </section>

      <section className="page !pt-8">
        <div className="mb-5 flex items-baseline justify-between gap-4">
          <h2 className="text-base text-[var(--ink)]">From the shelf</h2>
          <Link
            href="/shop"
            className="text-sm text-[var(--ink-muted)] hover:text-[var(--ink)]"
          >
            View all
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section id="pickup" className="border-t border-[var(--line)]">
        <div className="page grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-base text-[var(--ink)]">Reserve and pickup</h2>
            <p className="lede">
              Alcohol cannot be bought online in Massachusetts. The hold lasts
              two hours after the pickup time you choose, then you pay at the
              counter.
            </p>
            <ol className="mt-5 space-y-2 text-sm text-[var(--ink-muted)]">
              <li>1. Add bottles to your cart.</li>
              <li>2. Reserve them with your name and a pickup time.</li>
              <li>3. Come in, show your order number, and pay at the counter.</li>
            </ol>
          </div>
          <div className="text-sm">
            <h3 className="kicker">Find us</h3>
            <p className="mt-2 whitespace-pre-line text-[var(--ink)]">
              {store.address}
              {"\n"}
              {store.phone}
            </p>
            <h3 className="kicker mt-6">Hours</h3>
            <p className="mt-2 whitespace-pre-line text-[var(--ink-muted)]">
              {store.hours}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
