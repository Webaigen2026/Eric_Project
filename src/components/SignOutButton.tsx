"use client";

import { signOut } from "next-auth/react";

export function SignOutButton({
  className,
}: {
  className?: string;
}) {
  async function handleSignOut() {
    await signOut({ redirect: false });
    window.location.assign("/");
  }

  return (
    <button type="button" onClick={handleSignOut} className={className}>
      Sign out
    </button>
  );
}
