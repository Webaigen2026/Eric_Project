import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { verifyOtp } from "@/lib/otp";

const schema = z.object({
  email: z.string().email(),
  role: z.enum(["customer", "admin"]),
  otp: z.string().regex(/^\d{6}$/, "Code must be 6 digits"),
  password: z.string().min(6).max(100),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Enter the 6-digit code and a password of at least 6 characters." },
        { status: 400 }
      );
    }

    const email = parsed.data.email.trim();
    const { role, otp, password } = parsed.data;
    const passwordHash = await bcrypt.hash(password, 10);

    if (role === "admin") {
      const admin = await prisma.adminUser.findUnique({ where: { email } });
      const error = await checkCode(admin, otp);
      if (error) return error;
      await prisma.adminUser.update({
        where: { id: admin!.id },
        data: {
          passwordHash,
          otpHash: null,
          otpExpiresAt: null,
          otpPurpose: null,
        },
      });
      return NextResponse.json({ ok: true });
    }

    const customer = await prisma.customer.findUnique({ where: { email } });
    const error = await checkCode(customer, otp);
    if (error) return error;
    await prisma.customer.update({
      where: { id: customer!.id },
      data: {
        passwordHash,
        otpHash: null,
        otpExpiresAt: null,
        otpPurpose: null,
      },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[reset-password]", err);
    return NextResponse.json(
      { error: "Could not reset the password." },
      { status: 500 }
    );
  }
}

async function checkCode(
  account: { otpHash: string | null; otpExpiresAt: Date | null; otpPurpose: string | null } | null,
  otp: string
) {
  if (!account || !account.otpHash || !account.otpExpiresAt || account.otpPurpose !== "reset") {
    return NextResponse.json(
      { error: "No password reset is pending for that email." },
      { status: 404 }
    );
  }

  if (account.otpExpiresAt.getTime() < Date.now()) {
    return NextResponse.json(
      { error: "That code has expired. Request a new one." },
      { status: 410 }
    );
  }

  const valid = await verifyOtp(otp, account.otpHash);
  if (!valid) {
    return NextResponse.json(
      { error: "Incorrect code. Try again." },
      { status: 401 }
    );
  }

  return null;
}
