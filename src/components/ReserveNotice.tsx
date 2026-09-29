import { MASSACHUSETTS_RESERVE_NOTICE } from "@/lib/format";

export function ReserveNotice() {
  return (
    <div
      role="status"
      className="border-l-2 border-[var(--amber)] py-1 pl-3 text-sm leading-relaxed text-[var(--ink-muted)]"
    >
      <p className="mb-1 text-[var(--ink)]">Massachusetts pickup only</p>
      <p>{MASSACHUSETTS_RESERVE_NOTICE}</p>
    </div>
  );
}
