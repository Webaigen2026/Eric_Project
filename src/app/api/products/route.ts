import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify, CATEGORIES } from "@/lib/format";
import { getHeldQuantities } from "@/lib/stock";

const productSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(2000).optional().default(""),
  category: z.enum(CATEGORIES),
  priceCents: z.number().int().positive(),
  stockOnHand: z.number().int().min(0),
  imageUrl: z.string().optional().nullable(),
  isActive: z.boolean().optional().default(true),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const q = searchParams.get("q");
  const all = searchParams.get("all") === "1";

  const session = await auth();
  const isAdmin = !!session?.user;

  const products = await prisma.product.findMany({
    where: {
      ...(all && isAdmin ? {} : { isActive: true }),
      ...(category ? { category } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q } },
              { description: { contains: q } },
            ],
          }
        : {}),
    },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  const held = await getHeldQuantities(products.map((p) => p.id));
  const withAvailability = products.map((p) => ({
    ...p,
    held: held.get(p.id) ?? 0,
    available: Math.max(0, p.stockOnHand - (held.get(p.id) ?? 0)),
  }));

  return NextResponse.json({ products: withAvailability });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid product", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;
  let slug = slugify(data.name);
  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now().toString(36)}`;

  const product = await prisma.product.create({
    data: {
      name: data.name,
      slug,
      description: data.description ?? "",
      category: data.category,
      priceCents: data.priceCents,
      stockOnHand: data.stockOnHand,
      imageUrl: data.imageUrl || null,
      isActive: data.isActive ?? true,
    },
  });

  return NextResponse.json({ product }, { status: 201 });
}
