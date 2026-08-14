import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { withAuth, withAdmin } from "@/lib/api-handlers";
import { getAdminClient } from "@/services/supabase-admin";

export const GET = withAuth(async (request: NextRequest, { supabase }) => {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");

  let query = supabase
    .from("profiles")
    .select("*")
    .eq("role", "customer")
    .eq("is_active", true)
    .order("full_name", { ascending: true });
  if (search) query = query.ilike("full_name", `%${search}%`);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
});

export const POST = withAdmin(async (request: NextRequest) => {
  const body = await request.json();
  const { email, password, full_name, phone, date_of_birth, notes } = body;

  if (!email || !password || !full_name) {
    return NextResponse.json({ error: "email, password and full_name are required" }, { status: 400 });
  }

  const admin = getAdminClient();

  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name },
  });
  if (createErr || !created.user) {
    return NextResponse.json({ error: createErr?.message ?? "Failed to create user" }, { status: 500 });
  }

  const profileId = created.user.id;

  const { data: profile, error: profileErr } = await admin
    .from("profiles")
    .upsert({
      id: profileId,
      role: "customer",
      full_name,
      phone: phone ?? null,
      date_of_birth: date_of_birth ?? null,
      notes: notes ?? null,
      is_active: true,
    })
    .select()
    .single();

  if (profileErr) return NextResponse.json({ error: profileErr.message }, { status: 500 });

  return NextResponse.json({ data: profile }, { status: 201 });
});
