import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { withAuth, withAdmin } from "@/lib/api-handlers";
import { getAdminClient } from "@/services/supabase-admin";

export const GET = withAuth(async (request, { supabase }) => {
  const { searchParams } = new URL(request.url);
  const profileId = searchParams.get("profileId");

  let query = supabase
    .from("staff_profiles")
    .select("*, profiles(id, full_name, avatar_url, phone, is_active)")
    .order("created_at", { ascending: false });

  if (profileId) query = query.eq("profile_id", profileId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
});

export const POST = withAdmin(async (request: NextRequest) => {
  const body = await request.json();
  const { email, password, full_name, phone, bio, specializations, hire_date, commission_rate, hourly_rate } =
    body;

  if (!email || !password || !full_name) {
    return NextResponse.json({ error: "email, password and full_name are required" }, { status: 400 });
  }

  const admin = getAdminClient();

  // Create the auth user (trigger creates a profiles row with role from metadata)
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name, role: "staff" },
  });
  if (createErr || !created.user) {
    return NextResponse.json({ error: createErr?.message ?? "Failed to create user" }, { status: 500 });
  }

  const profileId = created.user.id;

  // Ensure profile has role staff + phone (trigger may default to customer if metadata missed)
  await admin
    .from("profiles")
    .update({ role: "staff", full_name, phone: phone ?? null })
    .eq("id", profileId);

  const { data: staff, error: staffErr } = await admin
    .from("staff_profiles")
    .insert({
      profile_id: profileId,
      bio: bio ?? null,
      specializations: specializations ?? null,
      hire_date: hire_date ?? null,
      commission_rate: commission_rate ?? null,
      hourly_rate: hourly_rate ?? null,
      is_available: true,
    })
    .select()
    .single();
  if (staffErr) return NextResponse.json({ error: staffErr.message }, { status: 500 });

  return NextResponse.json({ data: staff }, { status: 201 });
});
