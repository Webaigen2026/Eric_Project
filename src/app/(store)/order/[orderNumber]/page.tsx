import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { expireReservations } from "@/lib/stock";
import { formatPrice, formatDateTime, statusLabel } from "@/lib/format";
import { ReserveNotice } from "@/components/ReserveNotice";
import { ReservationTimer } from "@/components/ReservationTimer";

type Props = { params: Promise<{ orderNumber: string }> };

export async function generateMetadata({ params }: Props) {
  const { orderNumber } = await params;
  return { title: `Order ${orderNumber}` };
}

export default async function OrderConfirmationPage({ params }: Props) {
  const { orderNumber } = await params;
  await expireReservations();
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: { include: { product: true } } },
  });

  if (!order) notFound();

  const settings = await prisma.storeSettings.findUnique({
    where: { id: "default" },
  });

  const total = order.items.reduce(
    (n, i) => n + i.unitPriceCents * i.quantity,
    0
  );

  return (
    <div className="page page-narrow">
      <p className="kicker">
        {order.status === "expired" ? "Reservation removed" : "Reservation confirmed"}
      </p>
      <h1 className="page-title mt-2">{order.orderNumber}</h1>
      <div className="mt-6">
        <ReserveNotice />
      </div>
      {order.status === "expired" ? (
        <p className="mt-4 text-[var(--ink-muted)]">
          This reservation passed the two hours after the pickup time, so it
          was removed. The items are back on the shelf.
        </p>
      ) : (
        <p className="mt-4 text-[var(--ink-muted)]">
          Your items are reserved until{" "}
          {formatDateTime(order.expiresAt)}. Come to the store, show this order
          number, and pay at the counter.
        </p>
      )}
      <ReservationTimer
        expiresAt={order.expiresAt?.toISOString() ?? null}
        status={order.status}
      />

      <div className="mt-6 space-y-2 border-y border-[var(--line)] py-3 text-sm">
        <p>
          <span className="text-[var(--ink-muted)]">Status:</span>{" "}
          <strong>{statusLabel(order.status)}</strong>
        </p>
        <p>
          <span className="text-[var(--ink-muted)]">Name:</span>{" "}
          {order.customerName}
        </p>
        <p>
          <span className="text-[var(--ink-muted)]">Preferred pickup:</span>{" "}
          {formatDateTime(order.preferredPickupAt)}
        </p>
        <p>
          <span className="text-[var(--ink-muted)]">Pickup at:</span>{" "}
          {settings?.address ?? "See store"}
        </p>
      </div>

      <ul className="mt-8 divide-y divide-[var(--line)] border-y border-[var(--line)]">
        {order.items.map((item) => (
          <li key={item.id} className="flex justify-between py-4">
            <span>
              {item.quantity}× {item.product.name}
            </span>
            <span>{formatPrice(item.unitPriceCents * item.quantity)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-right text-lg font-semibold">
        Due at pickup: {formatPrice(total)}
      </p>

      <Link
        href="/shop"
        className="mt-10 inline-block text-[var(--forest)] hover:underline"
      >
        Continue shopping
      </Link>
    </div>
  );
}
