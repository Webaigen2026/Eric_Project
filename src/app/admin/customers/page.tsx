import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/format";
import { RemoveCustomerButton } from "@/components/admin/RemoveCustomerButton";

export const metadata = { title: "Accounts" };

export default async function AdminCustomersPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      emailVerified: true,
      createdAt: true,
      _count: { select: { orders: true } },
    },
  });

  return (
    <div>
      <h1 className="page-title">Accounts</h1>
      <p className="lede">Customer accounts that can reserve a pickup.</p>

      <div className="mt-6 overflow-x-auto border border-[var(--line)] bg-[#141414]">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-[var(--line)] text-[var(--ink-muted)]">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Verified</th>
              <th className="px-4 py-3 font-medium">Orders</th>
              <th className="px-4 py-3 font-medium">Joined</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--line)]">
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td className="px-4 py-3">{customer.name}</td>
                <td className="px-4 py-3">{customer.email}</td>
                <td className="px-4 py-3 text-[var(--ink-muted)]">{customer.phone}</td>
                <td className="px-4 py-3 text-[var(--ink-muted)]">
                  {customer.emailVerified ? "Yes" : "No"}
                </td>
                <td className="px-4 py-3 tabular-nums">{customer._count.orders}</td>
                <td className="px-4 py-3 text-[var(--ink-muted)]">
                  {formatDateTime(customer.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <RemoveCustomerButton id={customer.id} name={customer.name} />
                </td>
              </tr>
            ))}
            {customers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-[var(--ink-muted)]">
                  No customer accounts yet
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
