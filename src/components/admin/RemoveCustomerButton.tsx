"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function RemoveCustomerButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove() {
    if (!window.confirm(`Remove ${name}'s account? Their past orders stay on file.`)) {
      return;
    }
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/customers/${id}`, { method: "DELETE" });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Could not remove account");
      return;
    }
    router.refresh();
  }

  return (
    <div className="text-right">
      <button
        type="button"
        onClick={remove}
        disabled={loading}
        className="text-sm text-[var(--ink-muted)] hover:text-[var(--ink)] disabled:opacity-50"
      >
        {loading ? "Removing…" : "Remove"}
      </button>
      {error ? <p className="form-error mt-1">{error}</p> : null}
    </div>
  );
}
