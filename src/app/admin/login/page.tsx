"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      role: "admin",
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="page page-narrow">
      <div className="w-full">
        <Link href="/" className="text-sm text-[var(--ink-muted)] hover:text-[var(--ink)]">
          Back to store
        </Link>
        <p className="kicker mt-6">Staff</p>
        <h1 className="page-title mt-2">Sign in</h1>
        <form onSubmit={onSubmit} className="mt-5 space-y-3">
          <label className="label">
            Email
            <input
              name="email"
              type="email"
              required
              defaultValue="admin@goku.example"
              className="field"
            />
          </label>
          <label className="label">
            Password
            <input name="password" type="password" required className="field" />
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
