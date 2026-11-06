import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getAvailableStock } from "@/lib/stock";
import { formatPrice } from "@/lib/format";
import { AddToCartButton } from "@/components/AddToCartButton";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  return { title: product?.name ?? "Product" };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product || !product.isActive) notFound();

  const available = await getAvailableStock(product.id, product.stockOnHand);

  return (
    <div className="product-detail page">
      <Link
        href="/shop"
        className="text-sm text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)]"
      >
        Back to shop
      </Link>

      <div className="mt-6 grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="product-media aspect-square w-full">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-end p-6 text-base text-[#666666]">
              {product.category}
            </div>
          )}
        </div>

        <div className="lg:sticky lg:top-8 lg:pt-2">
          <p className="kicker">{product.category}</p>
          <h1 className="page-title mt-3">{product.name}</h1>
          <p className="mt-4 font-[family-name:var(--font-display)] text-3xl text-[var(--amber)]">
            {formatPrice(product.priceCents)}
          </p>
          <p className="mt-5 max-w-md text-base leading-relaxed text-[var(--ink-muted)]">
            {product.description || "No description yet."}
          </p>
          <div className="mt-8 border-t border-[var(--line)] pt-8">
            <AddToCartButton
              product={{
                id: product.id,
                slug: product.slug,
                name: product.name,
                priceCents: product.priceCents,
                imageUrl: product.imageUrl,
                available,
              }}
            />
          </div>
          <p className="mt-5 max-w-md text-sm text-[var(--ink-muted)]">
            Reserved for in-store pickup. The hold lasts two hours after your
            pickup time. Pay at the counter when you arrive.
          </p>
        </div>
      </div>
    </div>
  );
}
