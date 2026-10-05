"use client";

import { FormEvent } from "react";
import { useRouter } from "next/navigation";

export function ShopSearch({
  q,
  category,
}: {
  q?: string;
  category?: string;
}) {
  const router = useRouter();

  function go(value: string) {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    const term = value.trim();
    if (term) params.set("q", term);
    const query = params.toString();
    router.replace(query ? `/shop?${query}` : "/shop");
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    go(String(data.get("q") ?? ""));
  }

  return (
    <form className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center" onSubmit={onSubmit}>
      <input
        type="search"
        name="q"
        defaultValue={q ?? ""}
        placeholder="Search"
        className="field mt-0 sm:max-w-sm"
        onChange={(event) => go(event.target.value)}
      />
      <button type="submit" className="btn btn-quiet">
        Search
      </button>
    </form>
  );
}
