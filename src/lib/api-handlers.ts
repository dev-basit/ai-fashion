import { createClient } from "@supabase/supabase-js";
import { getServerClient } from "@/services/supabase-server";
import { NextResponse } from "next/server";
import { getAdminClient } from "@/services/supabase-admin";
import { env } from "@/config/env";
import type { NextRequest } from "next/server";
import type { SupabaseClient, User } from "@supabase/supabase-js";

export interface AuthContext {
  user: User;
  supabase: SupabaseClient;
}

type RouteHandler = (req: NextRequest, auth: AuthContext, ctx: any) => Promise<NextResponse>;

// Resolves auth from Bearer token (tool/server calls) or session cookie (browser requests).
async function resolveAuth(req: NextRequest): Promise<AuthContext | null> {
  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (token) {
    const {
      data: { user },
    } = await getAdminClient().auth.getUser(token);
    if (!user) return null;
    // Scoped client — carries the user JWT so RLS applies correctly
    const supabase = createClient(env.supabase.url, env.supabase.publishableKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    return { user, supabase };
  }

  // Cookie-based session for browser requests
  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  return { user, supabase };
}

export function withAuth(handler: RouteHandler) {
  return async (req: NextRequest, ctx: any): Promise<NextResponse> => {
    const auth = await resolveAuth(req);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return handler(req, auth, ctx);
  };
}

export function withAdmin(handler: RouteHandler) {
  return async (req: NextRequest, ctx: any): Promise<NextResponse> => {
    const auth = await resolveAuth(req);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { data: profile } = await auth.supabase.from("profiles").select("role").eq("id", auth.user.id).single();
    if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return handler(req, auth, ctx);
  };
}
