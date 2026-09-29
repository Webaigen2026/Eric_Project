"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CATEGORIES } from "@/lib/format";

type ProductFormValues = {
  id?: string;
  name: string;
  description: string;
  category: string;
  priceCents: number;
  stockOnHand: number;
  imageUrl: string | null;
  isActive: boolean;
};

function imageFileFromClipboard(data: DataTransfer | null): File | null {
  if (!data) return null;
  for (const item of data.items) {
    if (item.kind === "file" && item.type.startsWith("image/")) {
      const file = item.getAsFile();
      if (file) return file;
    }
  }
  for (const file of data.files) {
    if (file.type.startsWith("image/")) return file;
  }
  return null;
}

function namedImageFile(file: File): File {
  if (file.name.includes(".")) return file;
  const subtype = file.type.split("/")[1] || "png";
  const ext = subtype === "jpeg" ? "jpg" : subtype;
  return new File([file], `paste.${ext}`, { type: file.type || "image/png" });
}

export function ProductForm({
  initial,
}: {
  initial?: ProductFormValues;
}) {
  const router = useRouter();
  const isEdit = !!initial?.id;
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onUpload = useCallback(async (file: File) => {
    setUploading(true);
    setError(null);
    const form = new FormData();
    form.append("file", namedImageFile(file));
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = await res.json();
    setUploading(false);
    if (res.ok) setImageUrl(data.url);
    else setError(data.error || "Upload failed");
  }, []);

  useEffect(() => {
    function onWindowPaste(event: ClipboardEvent) {
      const target = event.target;
      if (target instanceof HTMLElement) {
        const tag = target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable) {
          return;
        }
      }
      const file = imageFileFromClipboard(event.clipboardData);
      if (!file) return;
      event.preventDefault();
      void onUpload(file);
    }
    window.addEventListener("paste", onWindowPaste);
    return () => window.removeEventListener("paste", onWindowPaste);
  }, [onUpload]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const price = Number(form.get("price"));
    const payload = {
      name: String(form.get("name")),
      description: String(form.get("description") || ""),
      category: String(form.get("category")),
      priceCents: Math.round(price * 100),
      stockOnHand: Number(form.get("stockOnHand")),
      imageUrl: imageUrl || null,
      isActive: form.get("isActive") === "on",
    };

    const res = await fetch(
      isEdit ? `/api/products/${initial!.id}` : "/api/products",
      {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Save failed");
      return;
    }
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <div>
      <Link
        href="/admin/products"
        className="text-sm text-[var(--forest)] hover:underline"
      >
        Products
      </Link>
      <h1 className="page-title mt-3">
        {isEdit ? "Edit product" : "New product"}
      </h1>

      <form onSubmit={onSubmit} className="mt-8 max-w-xl space-y-5">
        <label className="block">
          <span className="text-sm font-medium">Name</span>
          <input
            name="name"
            required
            defaultValue={initial?.name}
            className="field"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Description</span>
          <textarea
            name="description"
            rows={4}
            defaultValue={initial?.description}
            className="field"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Category</span>
          <select
            name="category"
            defaultValue={initial?.category ?? "Spirits"}
            className="field"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium">Price (USD)</span>
            <input
              name="price"
              type="number"
              step="0.01"
              min="0.01"
              required
              defaultValue={
                initial ? (initial.priceCents / 100).toFixed(2) : ""
              }
              className="field"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Stock on hand</span>
            <input
              name="stockOnHand"
              type="number"
              min={0}
              required
              defaultValue={initial?.stockOnHand ?? 0}
              className="field"
            />
          </label>
        </div>

        <div>
          <span className="text-sm font-medium">Image</span>
          <p className="mt-1 text-sm text-[var(--ink-muted)]">
            Upload a file, or copy an image and paste it here. It fills the product square.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void onUpload(file);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            className="btn btn-quiet mt-3"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? "Uploading…" : "Upload image"}
          </button>
          <div
            tabIndex={0}
            className="mt-3 aspect-square w-full max-w-64 overflow-hidden border border-[var(--line)] bg-[#161616] outline-none focus-visible:border-[var(--ink)]"
          >
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-end p-3">
                <span className="text-xs text-[var(--ink-muted)]">
                  {uploading ? "Uploading…" : "Paste an image"}
                </span>
              </div>
            )}
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            name="isActive"
            type="checkbox"
            defaultChecked={initial?.isActive ?? true}
          />
          Active on storefront
        </label>

        {error ? <p className="text-sm text-red-700">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? "Saving…" : "Save product"}
        </button>
      </form>
    </div>
  );
}
