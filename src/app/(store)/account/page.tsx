import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDateTime, statusLabel } from "@/lib/format";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/SignOutButton";

export const metadata = { title: "My account" };

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "customer") {
    redirect("/login");
  }

  const customer = await prisma.customer.findUnique({
    where: { id: session.user.id },
  });

  const orders = await prisma.order.findMany({
    where: { customerId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { items: { include: { product: true } } },
  });

  return (
    <div className="page max-w-3xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="page-title">Account</h1>
          <p className="lede">
            Show your name and order number at pickup so we can find your reservation.
          </p>
        </div>
        <SignOutButton className="btn btn-quiet" />
      </div>

      <dl className="mt-6 border-y border-[var(--line)] py-3 text-sm">
        <div className="flex justify-between gap-4 py-1">
          <dt className="text-[var(--ink-muted)]">Name</dt>
          <dd>{customer?.name ?? session.user.name}</dd>
        </div>
        <div className="flex justify-between gap-4 py-1">
          <dt className="text-[var(--ink-muted)]">Phone</dt>
          <dd>{customer?.phone ?? session.user.phone}</dd>
        </div>
        <div className="flex justify-between gap-4 py-1">
          <dt className="text-[var(--ink-muted)]">Email</dt>
          <dd className="truncate">{session.user.email}</dd>
        </div>
      </dl>

      <div className="mt-8">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-base">Reservations</h2>
          <Link href="/shop" className="text-sm text-[var(--forest)] hover:underline">
            Shop
          </Link>
        </div>

        {orders.length === 0 ? (
          <p className="border-y border-[var(--line)] py-8 text-sm text-[var(--ink-muted)]">
            No holds yet.{" "}
            <Link href="/shop" className="text-[var(--forest)] hover:underline">
              Browse the shelf
            </Link>
          </p>
        ) : (
          <ul className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
            {orders.map((order) => {
              const total = order.items.reduce(
                (n, i) => n + i.unitPriceCents * i.quantity,
                0
              );
              return (
                <li key={order.id}>
                  <Link
                    href={`/order/${order.orderNumber}`}
                    className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 hover:bg-[#141414]/5"
                  >
                    <div>
                      <p className="font-medium">{order.orderNumber}</p>
                      <p className="text-sm text-[var(--ink-muted)]">
                        {statusLabel(order.status)} ·{" "}
                        {order.status === "pending" || order.status === "ready"
                          ? `pick up by ${formatDateTime(order.expiresAt)}`
                          : formatDateTime(order.createdAt)}
                      </p>
                    </div>
                    <span className="font-medium">{formatPrice(total)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
