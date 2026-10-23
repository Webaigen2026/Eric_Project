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
      <div className="store-nav mx-auto max-w-6xl overflow-hidden rounded-2xl border-2 border-[#a78bfa] bg-[#1f0f3d] shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
      {announcement ? (
        <div className="border-b-2 border-[#7c5cbf] px-4 py-2 text-center text-sm font-medium text-[#c4b5fd]">
          {announcement}
        </div>
      ) : null}
      <div className="flex h-16 items-center justify-between gap-3 px-5">
        <Link
          href="/"
          className="min-w-0 truncate font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight sm:text-3xl"
        >
          {storeName}
        </Link>
        <nav className="flex shrink-0 items-center gap-3 text-base font-semibold sm:gap-5 sm:text-lg">
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
