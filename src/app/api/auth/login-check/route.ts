import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ status: "invalid" }, { status: 400 });
  }

  const { email, password } = parsed.data;
  const customer = await prisma.customer.findUnique({ where: { email } });
  if (!customer) {
    return NextResponse.json({ status: "invalid" });
  }

  const valid = await bcrypt.compare(password, customer.passwordHash);
  if (!valid) {
    return NextResponse.json({ status: "invalid" });
  }

  if (!customer.emailVerified) {
    return NextResponse.json({ status: "unverified", email: customer.email });
  }

  return NextResponse.json({ status: "ok" });
}
