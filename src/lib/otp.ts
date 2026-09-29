import bcrypt from "bcryptjs";

export const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

export function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function hashOtp(otp: string): Promise<string> {
  return bcrypt.hash(otp, 10);
}

export async function verifyOtp(otp: string, hash: string): Promise<boolean> {
  return bcrypt.compare(otp, hash);
}

export function otpExpiryDate(from = new Date()): Date {
  return new Date(from.getTime() + OTP_TTL_MS);
}
