import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateOtp, hashOtp, otpExpiryDate } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/email";

const schema = z.object({
  email: z.string().email(),
  role: z.enum(["customer", "admin"]),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Enter a valid email." },
        { status: 400 }
      );
    }

    const email = parsed.data.email.trim();
    const { role } = parsed.data;
    const generic = {
      ok: true,
      message: "If that account exists, we sent a reset code to that email.",
    };

    if (role === "admin") {
      const admin = await prisma.adminUser.findUnique({ where: { email } });
      if (!admin) return NextResponse.json(generic);

      const otp = generateOtp();
      await prisma.adminUser.update({
        where: { id: admin.id },
        data: {
          otpHash: await hashOtp(otp),
          otpExpiresAt: otpExpiryDate(),
          otpPurpose: "reset",
        },
      });
      const mail = await sendOtpEmail(email, otp, admin.name ?? "there", "reset");
      return NextResponse.json(mailResponse(mail, generic.message));
    }

    const customer = await prisma.customer.findUnique({ where: { email } });
    if (!customer) return NextResponse.json(generic);

    const otp = generateOtp();
    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        otpHash: await hashOtp(otp),
        otpExpiresAt: otpExpiryDate(),
        otpPurpose: "reset",
      },
    });
    const mail = await sendOtpEmail(email, otp, customer.name, "reset");
    return NextResponse.json(mailResponse(mail, generic.message));
  } catch (err) {
    console.error("[forgot-password]", err);
    return NextResponse.json(
      { error: "Could not send a reset code." },
      { status: 500 }
    );
  }
}

function mailResponse(
  mail: { sent: boolean; devOtp?: string },
  sentMessage: string
) {
  return {
    ok: true,
    message: mail.sent
      ? sentMessage
      : "Email is not configured yet. Use the code shown on the next screen.",
    ...(mail.devOtp && process.env.NODE_ENV !== "production"
      ? { devOtp: mail.devOtp }
      : {}),
  };
}
