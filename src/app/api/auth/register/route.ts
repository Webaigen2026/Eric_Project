import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { generateOtp, hashOtp, otpExpiryDate } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/email";

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().min(7).max(30),
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid registration data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, phone, email, password } = parsed.data;
    const existing = await prisma.customer.findUnique({ where: { email } });
    if (existing?.emailVerified) {
      return NextResponse.json(
        { error: "An account with that email already exists." },
        { status: 409 }
      );
    }

    const otp = generateOtp();
    const otpHash = await hashOtp(otp);
    const otpExpiresAt = otpExpiryDate();
    const passwordHash = await bcrypt.hash(password, 10);

    const customer = existing
      ? await prisma.customer.update({
          where: { email },
          data: {
            name,
            phone,
            passwordHash,
            emailVerified: false,
            otpHash,
            otpExpiresAt,
          },
        })
      : await prisma.customer.create({
          data: {
            name,
            phone,
            email,
            passwordHash,
            emailVerified: false,
            otpHash,
            otpExpiresAt,
          },
        });

    const mail = await sendOtpEmail(email, otp, name);

    return NextResponse.json(
      {
        requiresVerification: true,
        email: customer.email,
        message: mail.sent
          ? "We sent a verification code to your email."
          : "Account created. Check the server console for your code (email not configured yet).",
        ...(mail.devOtp && process.env.NODE_ENV !== "production"
          ? { devOtp: mail.devOtp }
          : {}),
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[register]", err);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
