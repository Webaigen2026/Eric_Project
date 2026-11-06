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
    <header className="relative z-20 border-b border-[var(--line)] bg-[var(--nav)] backdrop-blur-xl">
      {announcement ? (
        <div className="border-b border-[var(--line)] bg-[rgba(198,165,106,0.08)] px-5 py-2 text-center text-sm text-[var(--amber-light)]">
          {announcement}
        </div>
      ) : null}
      <div className="store-nav mx-auto flex h-[4.5rem] max-w-6xl items-center justify-between gap-4 px-5">
        <Link
          href="/"
          className="min-w-0 truncate font-[family-name:var(--font-display)] text-[1.7rem] font-semibold tracking-tight sm:text-[1.95rem]"
        >
          {storeName}
        </Link>
        <nav className="flex shrink-0 items-center gap-5 text-[0.92rem] sm:gap-7 sm:text-[0.98rem]">
          <Link href="/shop">Shop</Link>
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
            <Link href="/login">Login</Link>
          )}
          <Link href="/cart" className="btn">
            Cart
            {itemCount > 0 ? <span className="ml-2">{itemCount}</span> : null}
          </Link>
        </nav>
      </div>
    </header>
  );
}
