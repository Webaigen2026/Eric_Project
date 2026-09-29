import { NextResponse } from "next/server";
import { expireReservations } from "@/lib/stock";

export async function POST() {
  const expired = await expireReservations();
  return NextResponse.json({ expired });
}
