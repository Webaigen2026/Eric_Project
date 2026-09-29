import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { AuthProvider } from "@/components/AuthProvider";
import { expireReservations } from "@/lib/stock";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/customers", label: "Accounts" },
  { href: "/admin/settings", label: "Settings" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await expireReservations();
  const session = await auth();

  // Login page uses minimal chrome
  if (!session?.user) {
    return (
      <AuthProvider>
        <div className="min-h-screen bg-black text-[var(--ink)]">
          {children}
        </div>
      </AuthProvider>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--ink)]">
      <header className="border-b border-[var(--line)]">
        <div className="mx-auto flex h-14 max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4">
          <div className="flex items-center gap-5">
            <Link href="/admin" className="text-sm text-[var(--ink)]">
              Da liquor-store
            </Link>
            <nav className="flex flex-wrap gap-4 text-sm text-[var(--ink-muted)]">
              {links.map((l) => (
                <Link key={l.href} href={l.href} className="hover:text-[var(--ink)]">
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4 text-sm text-[var(--ink-muted)]">
            <Link href="/" className="hover:text-[var(--ink)]">
              View store
            </Link>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/admin/login" });
              }}
            >
              <button type="submit" className="hover:text-[var(--ink)]">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <div className="page !pt-6">{children}</div>
    </div>
  );
}
