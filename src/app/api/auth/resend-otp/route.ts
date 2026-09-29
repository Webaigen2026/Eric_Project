import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateOtp, hashOtp, otpExpiryDate } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/email";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const { email } = parsed.data;
    const customer = await prisma.customer.findUnique({ where: { email } });
    if (!customer) {
      // Don't reveal whether the email exists
      return NextResponse.json({
        ok: true,
        message: "If that account exists, a new code was sent.",
      });
    }

    if (customer.emailVerified) {
      return NextResponse.json({
        ok: true,
        alreadyVerified: true,
        message: "Email already verified. You can sign in.",
      });
    }

    const otp = generateOtp();
    const otpHash = await hashOtp(otp);
    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        otpHash,
        otpExpiresAt: otpExpiryDate(),
      },
    });

    const mail = await sendOtpEmail(email, otp, customer.name);

    return NextResponse.json({
      ok: true,
      message: mail.sent
        ? "A new code was sent to your email."
        : "New code generated. Check the server console (email not configured yet).",
      ...(mail.devOtp && process.env.NODE_ENV !== "production"
        ? { devOtp: mail.devOtp }
        : {}),
    });
  } catch (err) {
    console.error("[resend-otp]", err);
    return NextResponse.json({ error: "Could not resend code" }, { status: 500 });
  }
}
