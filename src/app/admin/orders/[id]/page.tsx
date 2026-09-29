import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { OrderActions } from "@/components/admin/OrderActions";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id } });
  return { title: order?.orderNumber ?? "Order" };
}

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { product: true } } },
  });
  if (!order) notFound();

  return (
    <OrderActions
      order={{
        ...order,
        preferredPickupAt: order.preferredPickupAt?.toISOString() ?? null,
        expiresAt: order.expiresAt?.toISOString() ?? null,
        createdAt: order.createdAt.toISOString(),
      }}
    />
  );
}
