"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  expiresAt: string | null;
  status: string;
};

function formatRemaining(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return [hours, minutes, seconds]
    .map((n) => String(n).padStart(2, "0"))
    .join(":");
}

export function ReservationTimer({ expiresAt, status }: Props) {
  const router = useRouter();
  const [now, setNow] = useState(() => Date.now());
  const expiring = useRef(false);
  const open = status === "pending" || status === "ready";

  useEffect(() => {
    if (!open) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [open]);

  useEffect(() => {
    if (!open || !expiresAt) return;
    const remaining = new Date(expiresAt).getTime() - now;
    if (remaining > 0 || expiring.current) return;
    expiring.current = true;
    fetch("/api/orders/expire", { method: "POST" }).finally(() => {
      router.refresh();
    });
  }, [open, expiresAt, now, router]);

  if (!open || !expiresAt) return null;

  const remaining = new Date(expiresAt).getTime() - now;

  return (
    <p className="mt-4 border-y border-[var(--line)] py-3 text-sm">
      Time left to pick up:{" "}
      <strong className="font-mono text-base">
        {formatRemaining(remaining)}
      </strong>
      <span className="mt-1 block text-[var(--ink-muted)]">
        This is two hours after your pickup time. When it hits zero, the
        reservation is removed and the items go back on the shelf.
      </span>
    </p>
  );
}
