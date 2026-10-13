import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/format";
import { CreateAdminForm } from "@/components/admin/CreateAdminForm";

export const metadata = { title: "Staff" };

export default async function AdminStaffPage() {
  const admins = await prisma.adminUser.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  return (
    <div>
      <h1 className="page-title">Staff</h1>
      <p className="lede">
        Create another admin. They sign in at the staff login with the email and password you set.
      </p>

      <CreateAdminForm />

      <div className="mt-8 overflow-x-auto border border-[var(--line)] bg-[#141414]">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-b border-[var(--line)] text-[var(--ink-muted)]">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Added</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--line)]">
            {admins.map((admin) => (
              <tr key={admin.id}>
                <td className="px-4 py-3">{admin.name || "Admin"}</td>
                <td className="px-4 py-3">{admin.email}</td>
                <td className="px-4 py-3 text-[var(--ink-muted)]">
                  {formatDateTime(admin.createdAt)}
                </td>
              </tr>
            ))}
            {admins.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-[var(--ink-muted)]">
                  No staff accounts yet
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
