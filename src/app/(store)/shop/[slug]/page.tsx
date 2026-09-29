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
    <div className="page">
      <Link href="/shop" className="text-sm text-[var(--ink-muted)] hover:text-[var(--ink)]">
        Back to shop
      </Link>
      <div className="mt-4 grid gap-8 md:grid-cols-2">
        <div className="aspect-square overflow-hidden bg-[#161616]">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-end p-4 text-sm text-[var(--ink-muted)]">
              {product.category}
            </div>
          )}
        </div>
        <div>
          <p className="kicker">{product.category}</p>
          <h1 className="page-title mt-2">{product.name}</h1>
          <p className="mt-3 text-[var(--ink)]">{formatPrice(product.priceCents)}</p>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-[var(--ink-muted)]">
            {product.description || "No description yet."}
          </p>
          <div className="mt-6">
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
          <p className="mt-4 max-w-md text-sm text-[var(--ink-muted)]">
            Reserved for in-store pickup. Pay at the counter when you arrive.
          </p>
        </div>
      </div>
    </div>
  );
}
