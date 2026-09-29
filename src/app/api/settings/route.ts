import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const settingsSchema = z.object({
  storeName: z.string().min(1).max(100),
  tagline: z.string().max(200),
  address: z.string().min(1).max(300),
  phone: z.string().min(1).max(40),
  email: z.string().email(),
  hours: z.string().max(500),
  announcementBanner: z.string().max(300),
});

export async function GET() {
  const settings = await prisma.storeSettings.findUnique({
    where: { id: "default" },
  });
  return NextResponse.json({
    settings: settings ?? {
      id: "default",
      storeName: "Da liquor-store",
      tagline: "Fine spirits, local pickup",
      address: "",
      phone: "",
      email: "",
      hours: "",
      announcementBanner: "",
    },
  });
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid settings" }, { status: 400 });
  }

  const settings = await prisma.storeSettings.upsert({
    where: { id: "default" },
    update: parsed.data,
    create: { id: "default", ...parsed.data },
  });

  return NextResponse.json({ settings });
}
