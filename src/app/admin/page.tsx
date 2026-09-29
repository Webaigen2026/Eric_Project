import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { OPEN_HOLD_STATUSES } from "@/lib/stock";
import { formatPrice, statusLabel } from "@/lib/format";

export const metadata = { title: "Admin" };

export default async function AdminDashboardPage() {
  const [openOrders, recentOrders, products, accountHolders] = await Promise.all([
    prisma.order.count({
      where: { status: { in: [...OPEN_HOLD_STATUSES] } },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { items: true },
    }),
    prisma.product.findMany({ where: { isActive: true } }),
    prisma.customer.count(),
  ]);

  const lowStock = products.filter((p) => p.stockOnHand <= 5);

  return (
    <div>
      <h1 className="page-title">Overview</h1>
      <dl className="mt-5 grid grid-cols-1 border-y border-[var(--line)] sm:grid-cols-4">
        <div className="border-b border-[var(--line)] py-3 sm:border-b-0 sm:pr-4">
          <dt className="text-sm text-[var(--ink-muted)]">Open reservations</dt>
          <dd className="mt-1 text-2xl tabular-nums">{openOrders}</dd>
        </div>
        <div className="border-b border-[var(--line)] py-3 sm:border-b-0 sm:border-l sm:px-4">
          <dt className="text-sm text-[var(--ink-muted)]">Active products</dt>
          <dd className="mt-1 text-2xl tabular-nums">{products.length}</dd>
        </div>
        <div className="border-b border-[var(--line)] py-3 sm:border-b-0 sm:border-l sm:px-4">
          <dt className="text-sm text-[var(--ink-muted)]">Low stock</dt>
          <dd className="mt-1 text-2xl tabular-nums">{lowStock.length}</dd>
        </div>
        <div className="py-3 sm:border-l sm:border-[var(--line)] sm:px-4">
          <dt className="text-sm text-[var(--ink-muted)]">Account holders</dt>
          <dd className="mt-1 text-2xl tabular-nums">
            <Link href="/admin/customers" className="hover:text-[var(--forest)]">
              {accountHolders}
            </Link>
          </dd>
        </div>
      </dl>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm text-[var(--ink)]">Recent orders</h2>
            <Link href="/admin/orders" className="text-sm text-[var(--forest)]">
              View all
            </Link>
          </div>
          <ul className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
            {recentOrders.map((order) => {
              const total = order.items.reduce(
                (n, i) => n + i.unitPriceCents * i.quantity,
                0
              );
              return (
                <li key={order.id}>
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="flex items-center justify-between py-2.5 hover:text-[var(--forest)]"
                  >
                    <div>
                      <p>{order.orderNumber}</p>
                      <p className="text-sm text-[var(--ink-muted)]">
                        {order.customerName} · {statusLabel(order.status)}
                      </p>
                    </div>
                    <span>{formatPrice(total)}</span>
                  </Link>
                </li>
              );
            })}
            {recentOrders.length === 0 ? (
              <li className="py-6 text-sm text-[var(--ink-muted)]">No orders yet</li>
            ) : null}
          </ul>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm text-[var(--ink)]">Low stock</h2>
            <Link href="/admin/products" className="text-sm text-[var(--ink-muted)] hover:text-[var(--ink)]">
              Manage
            </Link>
          </div>
          <ul className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
            {lowStock.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/admin/products/${p.id}`}
                  className="flex justify-between py-2.5 hover:text-[var(--forest)]"
                >
                  <span>{p.name}</span>
                  <span className="text-[var(--ink-muted)]">{p.stockOnHand} left</span>
                </Link>
              </li>
            ))}
            {lowStock.length === 0 ? (
              <li className="py-6 text-sm text-[var(--ink-muted)]">
                All stock looks healthy
              </li>
            ) : null}
          </ul>
        </section>
      </div>
    </div>
  );
}
