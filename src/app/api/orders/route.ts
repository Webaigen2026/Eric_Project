import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  expireReservations,
  generateOrderNumber,
  getAvailableStock,
  reserveExpiresAt,
} from "@/lib/stock";

const createOrderSchema = z.object({
  customerName: z.string().min(2).max(100),
  phone: z.string().min(7).max(30),
  email: z.string().email(),
  notes: z.string().max(500).optional().default(""),
  preferredPickupAt: z.string().min(1),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive().max(99),
      })
    )
    .min(1),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "customer") {
      return NextResponse.json(
        { error: "Please sign in to place a hold." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid order data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    await expireReservations();

    const data = parsed.data;
    const productIds = data.items.map((i) => i.productId);

    const preferredPickupAt = new Date(data.preferredPickupAt);
    if (Number.isNaN(preferredPickupAt.getTime())) {
      return NextResponse.json(
        { error: "Choose a pickup time." },
        { status: 400 }
      );
    }

    const order = await prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: { id: { in: productIds }, isActive: true },
      });

      if (products.length !== productIds.length) {
        throw new Error("One or more products are unavailable.");
      }

      const productMap = new Map(products.map((p) => [p.id, p]));

      for (const item of data.items) {
        const product = productMap.get(item.productId)!;
        const available = await getAvailableStock(
          product.id,
          product.stockOnHand,
          tx
        );
        if (item.quantity > available) {
          throw new Error(
            `Not enough stock for ${product.name}. Available: ${available}.`
          );
        }
      }

      let orderNumber = generateOrderNumber();
      for (let i = 0; i < 5; i++) {
        const exists = await tx.order.findUnique({ where: { orderNumber } });
        if (!exists) break;
        orderNumber = generateOrderNumber();
      }

      return tx.order.create({
        data: {
          orderNumber,
          customerId: session.user.id,
          customerName: data.customerName,
          phone: data.phone,
          email: data.email,
          notes: data.notes ?? "",
          preferredPickupAt,
          expiresAt: reserveExpiresAt(preferredPickupAt),
          status: "pending",
          items: {
            create: data.items.map((item) => {
              const product = productMap.get(item.productId)!;
              return {
                productId: product.id,
                quantity: item.quantity,
                unitPriceCents: product.priceCents,
              };
            }),
          },
        },
        include: {
          items: { include: { product: true } },
        },
      });
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to place order";
    const status =
      message.includes("stock") || message.includes("unavailable") ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      items: { include: { product: true } },
    },
  });
  return NextResponse.json({ orders });
}
