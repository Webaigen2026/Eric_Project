export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const CATEGORIES = ["Beer", "Wine", "Spirits", "Whiskey", "Rum", "Mixers", "Other"] as const;

export const ORDER_STATUSES = [
  "pending",
  "ready",
  "picked_up",
  "cancelled",
  "expired",
] as const;

export const MASSACHUSETTS_RESERVE_NOTICE =
  "In the state of Massachusetts you cannot order alcohol online. However, we can reserve the items for you. Once you hit Reserve, you will have to go to the store and pick up the order. You will have two hours after your pickup time. After that, the website will remove your order.";

export function statusLabel(status: string): string {
  switch (status) {
    case "pending":
      return "Reserved";
    case "ready":
      return "Ready for pickup";
    case "picked_up":
      return "Picked up";
    case "cancelled":
      return "Cancelled";
    case "expired":
      return "Expired";
    default:
      return status;
  }
}
