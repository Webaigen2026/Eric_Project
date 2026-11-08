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
      take: 8,
    }),
  ]);

  const store = settings ?? {
    storeName: "Da-Liquorstore",
    tagline: "Fine spirits, local pickup",
    address: "69 Drug Runner Ave Gotham",
    phone: "xxx-xxx-xxxx",
    hours: "Mon–Thu 10am–9pm\nFri–Sat 10am–11pm\nSun 12pm–7pm",
  };

  const held = await getHeldQuantities(products.map((p) => p.id));
  const featured = products.map((p) => ({
    ...p,
    available: Math.max(0, p.stockOnHand - (held.get(p.id) ?? 0)),
  }));
  const heroProduct = featured.find((p) => p.imageUrl) ?? featured[0];

  return (
    <>
      <section className="relative min-h-[78vh] overflow-hidden border-b border-[var(--line)]">
        <div className="absolute inset-0">
          {heroProduct?.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={heroProduct.imageUrl}
              alt=""
              className="h-full w-full object-cover opacity-35 animate-fade"
            />
          ) : (
            <div className="h-full w-full bg-[radial-gradient(circle_at_70%_40%,#3a2f22,transparent_55%)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b0a08] via-[#0b0a08]/88 to-[#0b0a08]/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0a08] via-transparent to-[#0b0a08]/45" />
        </div>

        <div className="page relative flex min-h-[78vh] flex-col justify-end !pb-16 !pt-28">
          <p className="kicker animate-rise">{store.storeName}</p>
          <h1 className="page-title mt-3 max-w-3xl animate-rise-delay">
            Hold online. Pick up in store.
          </h1>
          <p className="lede mt-4 max-w-xl animate-rise-delay">
            Reserve bottles for local pickup. Pay at the counter when you arrive.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 animate-rise-delay">
            <Link href="/shop" className="btn btn-primary">
              Shop the shelf
            </Link>
            <a href="#pickup" className="btn btn-quiet">
              How pickup works
            </a>
          </div>
        </div>
      </section>

      <section className="page !pt-14">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="kicker">Featured</p>
            <h2 className="section-title mt-2">From the shelf</h2>
          </div>
          <Link
            href="/shop"
            className="text-sm text-[var(--ink-muted)] hover:text-[var(--ink)]"
          >
            View all
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
          {featured.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section id="pickup" className="mt-8 border-t border-[var(--line)] bg-[rgba(255,255,255,0.015)]">
        <div className="page grid gap-12 md:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="kicker">Pickup</p>
            <h2 className="section-title mt-2">Reserve and collect</h2>
            <p className="lede">
              In Massachusetts you cannot buy alcohol online. Reserve your
              bottles, choose a pickup time, and pay in store.
            </p>
            <ol className="mt-8 space-y-5">
              {[
                "Add bottles to your cart.",
                "Reserve with your name and a pickup time.",
                "Show your order number and pay at the counter.",
              ].map((step, index) => (
                <li key={step} className="flex gap-4 text-[var(--ink)]">
                  <span className="font-[family-name:var(--font-display)] text-2xl text-[var(--amber)]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="pt-1 text-base text-[var(--ink-muted)]">{step}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="border border-[var(--line)] bg-[var(--surface)] p-6 md:p-8">
            <h3 className="kicker">Visit</h3>
            <p className="mt-3 whitespace-pre-line text-lg text-[var(--ink)]">
              {store.address}
              {"\n"}
              {store.phone}
            </p>
            <h3 className="kicker mt-8">Hours</h3>
            <p className="mt-3 whitespace-pre-line text-base text-[var(--ink-muted)]">
              {store.hours}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
