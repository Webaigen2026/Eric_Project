import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email(),
  password: z.string().min(6).max(100),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Enter a name, a valid email, and a password of at least 6 characters." },
        { status: 400 }
      );
    }

    const { name, password } = parsed.data;
    const email = parsed.data.email.trim();
    const existing = await prisma.adminUser.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "An admin with that email already exists." },
        { status: 409 }
      );
    }

    const admin = await prisma.adminUser.create({
      data: {
        name,
        email,
        passwordHash: await bcrypt.hash(password, 10),
      },
      select: { id: true, email: true, name: true },
    });

    return NextResponse.json(admin, { status: 201 });
  } catch (err) {
    console.error("[create-admin]", err);
    return NextResponse.json({ error: "Could not create the admin." }, { status: 500 });
  }
}
