import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDateTime, statusLabel } from "@/lib/format";

export const metadata = { title: "Orders" };

type Props = { searchParams: Promise<{ status?: string }> };

export default async function AdminOrdersPage({ searchParams }: Props) {
  const { status } = await searchParams;
  const orders = await prisma.order.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  const filters = [
    { label: "All", value: "" },
    { label: "Reserved", value: "pending" },
    { label: "Ready", value: "ready" },
    { label: "Picked up", value: "picked_up" },
    { label: "Cancelled", value: "cancelled" },
    { label: "Expired", value: "expired" },
  ];

  return (
    <div>
      <h1 className="page-title">Orders</h1>
      <div className="mt-4 flex flex-wrap gap-1 border-b border-[var(--line)]">
        {filters.map((f) => (
          <Link
            key={f.value || "all"}
            href={f.value ? `/admin/orders?status=${f.value}` : "/admin/orders"}
            className={(status || "") === f.value ? "chip chip-active" : "chip"}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto border border-[var(--line)] bg-[#141414]">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-[var(--line)] text-[var(--ink-muted)]">
            <tr>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Pickup</th>
              <th className="px-4 py-3 font-medium">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--line)]">
            {orders.map((order) => {
              const total = order.items.reduce(
                (n, i) => n + i.unitPriceCents * i.quantity,
                0
              );
              return (
                <tr key={order.id} className="hover:bg-[#141414]/5">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-medium text-[var(--forest)] hover:underline"
                    >
                      {order.orderNumber}
                    </Link>
                    <p className="text-xs text-[var(--ink-muted)]">
                      {formatDateTime(order.createdAt)}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    {order.customerName}
                    <p className="text-xs text-[var(--ink-muted)]">
                      {order.phone}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3 text-[var(--ink-muted)]">
                    {formatDateTime(order.preferredPickupAt)}
                  </td>
                  <td className="px-4 py-3">{formatPrice(total)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {orders.length === 0 ? (
          <p className="py-10 text-center text-[var(--ink-muted)]">
            No orders in this view.
          </p>
        ) : null}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-900",
    ready: "bg-emerald-100 text-emerald-900",
    picked_up: "bg-stone-200 text-stone-700",
    cancelled: "bg-red-100 text-red-800",
    expired: "bg-stone-200 text-stone-600",
  };
  return (
    <span
      className={`inline-block px-2 py-0.5 text-xs font-medium ${colors[status] ?? "bg-stone-100"}`}
    >
      {statusLabel(status)}
    </span>
  );
}
