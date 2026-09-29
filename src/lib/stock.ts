import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";

export const OPEN_HOLD_STATUSES: string[] = ["pending", "ready"];

/** A reservation lasts two hours after the chosen pickup time, then the hold is removed. */
export const RESERVE_WINDOW_MS = 2 * 60 * 60 * 1000;

export function reserveExpiresAt(from = new Date()): Date {
  return new Date(from.getTime() + RESERVE_WINDOW_MS);
}

export async function expireReservations(): Promise<number> {
  const now = new Date();
  const fallbackCutoff = new Date(now.getTime() - RESERVE_WINDOW_MS);
  const result = await prisma.order.updateMany({
    where: {
      status: { in: OPEN_HOLD_STATUSES },
      OR: [
        { expiresAt: { lt: now } },
        { expiresAt: null, createdAt: { lt: fallbackCutoff } },
      ],
    },
    data: { status: "expired" },
  });
  return result.count;
}

export async function getHeldQuantities(
  productIds?: string[],
  tx: Prisma.TransactionClient | typeof prisma = prisma
): Promise<Map<string, number>> {
  const holds = await tx.orderItem.groupBy({
    by: ["productId"],
    where: {
      ...(productIds ? { productId: { in: productIds } } : {}),
      order: { status: { in: OPEN_HOLD_STATUSES } },
    },
    _sum: { quantity: true },
  });

  const map = new Map<string, number>();
  for (const row of holds) {
    map.set(row.productId, row._sum?.quantity ?? 0);
  }
  return map;
}

export async function getAvailableStock(
  productId: string,
  stockOnHand: number,
  tx: Prisma.TransactionClient | typeof prisma = prisma
): Promise<number> {
  const held = await tx.orderItem.aggregate({
    where: {
      productId,
      order: { status: { in: OPEN_HOLD_STATUSES } },
    },
    _sum: { quantity: true },
  });
  return Math.max(0, stockOnHand - (held._sum?.quantity ?? 0));
}

export function generateOrderNumber(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `EO-${date}-${rand}`;
}
