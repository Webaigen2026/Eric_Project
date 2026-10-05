"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useCart } from "./CartProvider";

type Props = {
  storeName: string;
  announcement?: string;
};

export function StoreHeader({ storeName, announcement }: Props) {
  const { itemCount } = useCart();
  const { data: session, status } = useSession();
  const isCustomer =
    status === "authenticated" && session?.user?.role === "customer";

  async function handleSignOut() {
    await signOut({ redirect: false });
    window.location.assign("/");
  }

  return (
    <header className="px-3 pt-3">
      <div className="store-nav mx-auto max-w-6xl overflow-hidden rounded-2xl border border-[#6d45a3] bg-[#3d1b6e] shadow-[0_8px_24px_rgba(0,0,0,0.28)]">
      {announcement ? (
        <div className="border-b border-[#6d45a3] px-4 py-1.5 text-center text-xs">
          {announcement}
        </div>
      ) : null}
      <div className="flex h-14 items-center justify-between gap-3 px-4">
        <Link
          href="/"
          className="min-w-0 truncate font-[family-name:var(--font-display)] text-xl font-medium tracking-tight"
        >
          {storeName}
        </Link>
        <nav className="flex shrink-0 items-center gap-3 text-sm sm:gap-4">
          <Link href="/shop">
            Shop
          </Link>
          <Link href="/#pickup" className="hidden sm:inline">
            Pickup
          </Link>
          {status === "loading" ? null : isCustomer ? (
            <>
              <Link href="/account">
                {session.user?.name?.split(" ")[0] || "Account"}
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="hidden sm:inline"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link href="/login">
              Login
            </Link>
          )}
          <Link href="/cart" className="btn">
            Cart
            {itemCount > 0 ? (
              <span className="ml-2">{itemCount}</span>
            ) : null}
          </Link>
        </nav>
      </div>
      </div>
    </header>
  );
}
