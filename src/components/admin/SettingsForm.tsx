"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Settings = {
  storeName: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
  announcementBanner: string;
};

export function SettingsForm({ initial }: { initial: Settings }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSaved(false);
    const form = new FormData(e.currentTarget);
    const payload = {
      storeName: String(form.get("storeName")),
      tagline: String(form.get("tagline")),
      address: String(form.get("address")),
      phone: String(form.get("phone")),
      email: String(form.get("email")),
      hours: String(form.get("hours")),
      announcementBanner: String(form.get("announcementBanner")),
    };

    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Save failed");
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <div>
      <h1 className="page-title">
        Store settings
      </h1>
      <form onSubmit={onSubmit} className="mt-8 max-w-xl space-y-5">
        <label className="block">
          <span className="text-sm font-medium">Store name</span>
          <input
            name="storeName"
            required
            defaultValue={initial.storeName}
            className="field"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Tagline</span>
          <input
            name="tagline"
            defaultValue={initial.tagline}
            className="field"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Address</span>
          <textarea
            name="address"
            required
            rows={2}
            defaultValue={initial.address}
            className="field"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium">Phone</span>
            <input
              name="phone"
              required
              defaultValue={initial.phone}
              className="field"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Email</span>
            <input
              name="email"
              type="email"
              required
              defaultValue={initial.email}
              className="field"
            />
          </label>
        </div>
        <label className="block">
          <span className="text-sm font-medium">Hours</span>
          <textarea
            name="hours"
            rows={4}
            defaultValue={initial.hours}
            className="field"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Announcement banner</span>
          <input
            name="announcementBanner"
            defaultValue={initial.announcementBanner}
            className="field"
            placeholder="Shown at top of storefront"
          />
        </label>

        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        {saved ? (
          <p className="text-sm text-[var(--forest)]">Settings saved.</p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? "Saving…" : "Save settings"}
        </button>
      </form>
    </div>
  );
}
