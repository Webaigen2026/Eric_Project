import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getHeldQuantities } from "@/lib/stock";
import { formatPrice } from "@/lib/format";

export const metadata = { title: "Products" };

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
  });
  const held = await getHeldQuantities(products.map((p) => p.id));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="page-title">
          Products
        </h1>
        <Link
          href="/admin/products/new"
          className="btn btn-primary"
        >
          Add product
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto border border-[var(--line)] bg-[#141414]">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-[var(--line)] text-[var(--ink-muted)]">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">On hand</th>
              <th className="px-4 py-3 font-medium">Held</th>
              <th className="px-4 py-3 font-medium">Available</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--line)]">
            {products.map((p) => {
              const h = held.get(p.id) ?? 0;
              return (
                <tr key={p.id} className="hover:bg-[#141414]/5">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="font-medium text-[var(--forest)] hover:underline"
                    >
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{p.category}</td>
                  <td className="px-4 py-3">{formatPrice(p.priceCents)}</td>
                  <td className="px-4 py-3">{p.stockOnHand}</td>
                  <td className="px-4 py-3">{h}</td>
                  <td className="px-4 py-3">
                    {Math.max(0, p.stockOnHand - h)}
                  </td>
                  <td className="px-4 py-3">
                    {p.isActive ? "Active" : "Inactive"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
