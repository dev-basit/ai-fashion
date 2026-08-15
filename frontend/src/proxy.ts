import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { config } from "./config/config";

const PUBLIC_ROUTES = ["/login", "/forgot-password"];
const DASHBOARD_ROUTES = ["/dashboard"];
const ADMIN_ONLY_ROUTES = ["/dashboard/settings", "/dashboard/staff", "/dashboard/reports"];
const STAFF_RESTRICTED_ROUTES = ["/dashboard/clients", "/dashboard/services"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname.includes(".")) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(config.supabase.url, config.supabase.publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request: { headers: request.headers } });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublicRoute = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));
  const isDashboardRoute = DASHBOARD_ROUTES.some((r) => pathname.startsWith(r));

  if (!user) {
    // Unauthenticated: allow landing page + auth pages; block dashboard
    if (isDashboardRoute) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return response;
  }

  // Logged-in: redirect away from auth pages to dashboard
  if (isPublicRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const role = profile?.role ?? "customer";

  if (ADMIN_ONLY_ROUTES.some((r) => pathname.startsWith(r)) && role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (STAFF_RESTRICTED_ROUTES.some((r) => pathname.startsWith(r)) && role === "customer") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  response.headers.set("x-user-role", role);
  response.headers.set("x-user-id", user.id);

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
