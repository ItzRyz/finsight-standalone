import { NextResponse } from "next/server";
import { getRates } from "@/lib/currency/rates";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const base = (searchParams.get("base") as "IDR" | "USD" | "EUR" | "JPY" | "SGD") ?? "IDR";
  const rates = await getRates(base);
  return NextResponse.json({ base, rates, cached: true }, { headers: { "Cache-Control": "public, s-maxage=3600" } });
}
