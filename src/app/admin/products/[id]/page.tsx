import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  return { title: product?.name ?? "Product" };
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) notFound();

  return (
    <ProductForm
      initial={{
        id: product.id,
        name: product.name,
        description: product.description,
        category: product.category,
        priceCents: product.priceCents,
        stockOnHand: product.stockOnHand,
        imageUrl: product.imageUrl,
        isActive: product.isActive,
      }}
    />
  );
}
