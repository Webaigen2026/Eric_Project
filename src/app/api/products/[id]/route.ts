import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify, CATEGORIES } from "@/lib/format";
import { getAvailableStock } from "@/lib/stock";

const productSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(2000).optional().default(""),
  category: z.enum(CATEGORIES),
  priceCents: z.number().int().positive(),
  stockOnHand: z.number().int().min(0),
  imageUrl: z.string().optional().nullable(),
  isActive: z.boolean().optional().default(true),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const available = await getAvailableStock(product.id, product.stockOnHand);
  return NextResponse.json({
    product: { ...product, available },
  });
}

export async function PATCH(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid product" }, { status: 400 });
  }

  const data = parsed.data;
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let slug = existing.slug;
  if (data.name !== existing.name) {
    slug = slugify(data.name);
    const clash = await prisma.product.findFirst({
      where: { slug, NOT: { id } },
    });
    if (clash) slug = `${slug}-${Date.now().toString(36)}`;
  }

  const product = await prisma.product.update({
    where: { id },
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

  return NextResponse.json({ product });
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.product.update({
    where: { id },
    data: { isActive: false },
  });

  return NextResponse.json({ ok: true });
}
