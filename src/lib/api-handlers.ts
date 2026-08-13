import { getServerClient } from "@/services/supabase-server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { SupabaseClient, User } from "@supabase/supabase-js";

export interface AuthContext {
  user: User;
  supabase: SupabaseClient;
}

type RouteHandler = (req: NextRequest, auth: AuthContext, ctx: any) => Promise<NextResponse>;

// Wraps a route handler — injects authenticated user + supabase client, returns 401 if not logged in.
export function withAuth(handler: RouteHandler) {
  return async (req: NextRequest, ctx: any): Promise<NextResponse> => {
    const supabase = await getServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return handler(req, { user, supabase }, ctx);
  };
}

// Like withAuth, but also enforces role === "admin". Returns 403 for any other role.
export function withAdmin(handler: RouteHandler) {
  return async (req: NextRequest, ctx: any): Promise<NextResponse> => {
    const supabase = await getServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return handler(req, { user, supabase }, ctx);
  };
}
