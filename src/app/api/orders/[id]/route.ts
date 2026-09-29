import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OPEN_HOLD_STATUSES } from "@/lib/stock";

const updateSchema = z.object({
  status: z.enum(["pending", "ready", "picked_up", "cancelled"]),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { product: true } } },
  });

  if (!order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ order });
}

export async function PATCH(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const newStatus = parsed.data.status;

  try {
    const order = await prisma.$transaction(async (tx) => {
      const existing = await tx.order.findUnique({
        where: { id },
        include: { items: true },
      });
      if (!existing) throw new Error("NOT_FOUND");

      const wasOpen = (OPEN_HOLD_STATUSES as readonly string[]).includes(
        existing.status
      );
      const willBePickedUp = newStatus === "picked_up";
      const alreadyPickedUp = existing.status === "picked_up";

      // When marking picked_up from an open hold, decrement physical stock
      if (willBePickedUp && wasOpen && !alreadyPickedUp) {
        for (const item of existing.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stockOnHand: { decrement: item.quantity } },
          });
        }
      }

      // If reverting from picked_up back to an open status, restore stock
      if (alreadyPickedUp && wasOpen === false && (OPEN_HOLD_STATUSES as readonly string[]).includes(newStatus)) {
        for (const item of existing.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stockOnHand: { increment: item.quantity } },
          });
        }
      }

      // Cancel from picked_up shouldn't re-add stock (sale already completed)
      // Cancel from pending/ready just releases hold — no stock change needed

      return tx.order.update({
        where: { id },
        data: { status: newStatus },
        include: { items: { include: { product: true } } },
      });
    });

    return NextResponse.json({ order });
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
