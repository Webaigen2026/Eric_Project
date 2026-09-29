import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyOtp } from "@/lib/otp";

const schema = z.object({
  email: z.string().email(),
  otp: z.string().regex(/^\d{6}$/, "Code must be 6 digits"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Enter the 6-digit code from your email." },
        { status: 400 }
      );
    }

    const { email, otp } = parsed.data;
    const customer = await prisma.customer.findUnique({ where: { email } });
    if (!customer || !customer.otpHash || !customer.otpExpiresAt) {
      return NextResponse.json(
        { error: "No pending verification for that email." },
        { status: 404 }
      );
    }

    if (customer.emailVerified) {
      return NextResponse.json({ ok: true, alreadyVerified: true });
    }

    if (customer.otpExpiresAt.getTime() < Date.now()) {
      return NextResponse.json(
        { error: "That code has expired. Request a new one." },
        { status: 410 }
      );
    }

    const valid = await verifyOtp(otp, customer.otpHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Incorrect code. Try again." },
        { status: 401 }
      );
    }

    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        emailVerified: true,
        otpHash: null,
        otpExpiresAt: null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[verify-otp]", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
