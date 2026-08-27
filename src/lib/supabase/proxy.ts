import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },

      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        response = NextResponse.next({
          request,
        });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // IMPORTANT:
  // Always refresh/get the user before making redirect decisions.
  const { data } = await supabase.auth.getClaims();

  const claims = data?.claims;

  const pathname = request.nextUrl.pathname;

  /*
   * Routes that should only be accessible
   * when the user is NOT authenticated.
   */
  const isAuthPage =
    pathname === "/auth" ||
    pathname.startsWith("/password/forgot") ||
    pathname.startsWith("/password/reset");

  /*
   * Routes that require authentication.
   */
  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/expenses") ||
    pathname.startsWith("/budgets") ||
    pathname.startsWith("/categories") ||
    pathname.startsWith("/notifications") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/admin");

  /*
   * User is not authenticated
   * but tries to access protected route.
   */
  if (!claims && isProtectedRoute) {
    const url = request.nextUrl.clone();

    url.pathname = "/auth";
    url.searchParams.set("redirect", pathname);

    return NextResponse.redirect(url);
  }

  /*
   * User is already authenticated
   * but tries to access auth page.
   */
  if (claims && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}
