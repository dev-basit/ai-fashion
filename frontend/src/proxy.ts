import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { config as env } from "./config/config";

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

  const supabase = createServerClient(env.supabase.url, env.supabase.publishableKey, {
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

  // getUser() contacts the Supabase server to verify the JWT.
  // When offline it fails with status 0 (network error) — that is NOT the same
  // as "user is unauthenticated". Only redirect to login on a definitive auth
  // failure (non-zero HTTP status from the server).
  let user = null;
  let couldNotVerify = false;

  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      // status 0 → fetch/network error (offline, DNS failure, etc.)
      // non-zero → server said the token is invalid/expired
      couldNotVerify = !error.status || error.status === 0;
    } else {
      user = data.user;
    }
  } catch {
    couldNotVerify = true;
  }

  const isPublicRoute = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));
  const isDashboardRoute = DASHBOARD_ROUTES.some((r) => pathname.startsWith(r));

  // Only block unauthenticated access when we got a definitive "not logged in"
  // answer from the server. If we couldn't reach the server, let the request
  // through — the client-side offline screen will handle the UX.
  if (!user && !couldNotVerify) {
    if (isDashboardRoute) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return response;
  }

  // Logged-in user hitting a public (auth) page → send to dashboard
  if (user && isPublicRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Role-based route protection. The profiles query also requires network —
  // skip the check when we couldn't reach Supabase (offline).
  if (user) {
    let role: string | null = null;
    try {
      const { data: profile, error } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      if (!error) role = profile?.role ?? "customer";
    } catch {
      // offline — leave role null so we skip restricted-route redirects
    }

    if (role !== null) {
      if (ADMIN_ONLY_ROUTES.some((r) => pathname.startsWith(r)) && role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
      if (STAFF_RESTRICTED_ROUTES.some((r) => pathname.startsWith(r)) && role === "customer") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
      response.headers.set("x-user-role", role);
      response.headers.set("x-user-id", user.id);
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
