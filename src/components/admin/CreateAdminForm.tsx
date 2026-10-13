"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function CreateAdminForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    const form = e.currentTarget;
    const data = new FormData(form);
    const res = await fetch("/api/admins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: String(data.get("name") || ""),
        email: String(data.get("email") || ""),
        password: String(data.get("password") || ""),
      }),
    });
    const body = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(body.error || "Could not create the admin.");
      return;
    }
    form.reset();
    setMessage(`${body.email} can sign in at staff login.`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 max-w-md space-y-3">
      <label className="label">
        Name
        <input name="name" required minLength={2} className="field" />
      </label>
      <label className="label">
        Email
        <input name="email" type="email" required className="field" />
      </label>
      <label className="label">
        Password
        <input
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          className="field"
        />
      </label>
      {error ? <p className="form-error">{error}</p> : null}
      {message ? <p className="text-sm text-[var(--ink-muted)]">{message}</p> : null}
      <button type="submit" disabled={loading} className="btn btn-primary">
        {loading ? "Creating…" : "Create admin"}
      </button>
    </form>
  );
}
