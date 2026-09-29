import nodemailer from "nodemailer";

type SendOtpResult = {
  sent: boolean;
  previewUrl?: string;
  /** Only set when SMTP is not configured (local/dev fallback). */
  devOtp?: string;
};

export async function sendOtpEmail(
  to: string,
  otp: string,
  name: string
): Promise<SendOtpResult> {
  const storeName = process.env.STORE_EMAIL_NAME || "Da liquor-store";
  const subject = `${otp} is your ${storeName} verification code`;
  const text = `Hi ${name},

Your verification code is: ${otp}

It expires in 10 minutes. If you did not create an account, you can ignore this email.

— ${storeName}`;
  const html = `
    <div style="font-family: Georgia, serif; color: #1a1612; max-width: 480px;">
      <h1 style="font-size: 24px; color: #c4782c;">${storeName}</h1>
      <p>Hi ${name},</p>
      <p>Your verification code is:</p>
      <p style="font-size: 32px; letter-spacing: 6px; font-weight: bold;">${otp}</p>
      <p style="color: #5c5348;">It expires in 10 minutes. If you did not create an account, ignore this email.</p>
    </div>
  `;

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.info(
      `\n[email:dev] OTP for ${to}: ${otp}\n` +
        `(Set SMTP_HOST, SMTP_USER, SMTP_PASS to send real email.)\n`
    );
    return { sent: false, devOtp: otp };
  }

  const port = Number(process.env.SMTP_PORT || 587);
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  const from =
    process.env.SMTP_FROM || `"${storeName}" <${user}>`;

  const info = await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
  if (previewUrl) {
    console.info(`[email] Preview: ${previewUrl}`);
  }

  return { sent: true, previewUrl };
}
