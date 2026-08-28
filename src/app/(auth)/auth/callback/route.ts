import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);

  const code = requestUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(
      new URL("/auth?error=missing_code", requestUrl.origin),
    );
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("Auth callback error:", error.message);

    return NextResponse.redirect(
      new URL("/auth?error=confirmation_failed", requestUrl.origin),
    );
  }

  // Ensure Prisma user exists + apply IP-based locale/currency
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user?.email) {
      const { syncUser } = await import("@/lib/auth/sync-user");
      await syncUser({
        id: user.id,
        email: user.email!,
        name: (user.user_metadata?.name as string) ?? (user.user_metadata?.full_name as string) ?? null,
      });
      const country = request.headers.get("x-vercel-ip-country") ?? request.headers.get("cf-ipcountry");
      if (country) {
        const { mapCountryToLocale } = await import("@/lib/i18n/country-map");
        const mapped = mapCountryToLocale(country);
        if (mapped) {
          const { prisma } = await import("@/lib/prisma");
          const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { locale: true, currency: true } });
          if (dbUser && dbUser.locale === "id" && dbUser.currency === "IDR" && (mapped.locale !== "id" || mapped.currency !== "IDR")) {
            await prisma.user.update({ where: { id: user.id }, data: { locale: mapped.locale as never, currency: mapped.currency as never } });
          }
        }
      }
    }
  } catch (e) {
    console.error("syncUser/country locale failed", e);
  }

  return NextResponse.redirect(new URL("/dashboard", requestUrl.origin));
}
