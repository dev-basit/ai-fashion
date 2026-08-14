import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { withAuth } from "@/lib/api-handlers";
import { getAdminClient } from "@/services/supabase-admin";

export const GET = withAuth(async (_: NextRequest, { user, supabase }) => {
  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const role = me?.role as string | undefined;

  if (role === "admin") {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, role")
      .eq("is_active", true)
      .neq("id", user.id)
      .order("full_name");
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  }

  if (role === "customer") {
    // Get staff profile_ids from appointments assigned to this customer
    const admin = getAdminClient();
    const { data: apts } = await admin
      .from("appointments")
      .select("staff_profile_id, staff_profiles(profile_id)")
      .eq("client_id", user.id);

    const staffProfileIds = (apts ?? [])
      .map((a) => (a.staff_profiles as { profile_id: string } | null)?.profile_id)
      .filter(Boolean) as string[];

    const orFilter = staffProfileIds.length
      ? `role.eq.admin,id.in.(${staffProfileIds.join(",")})`
      : "role.eq.admin";

    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, role")
      .eq("is_active", true)
      .neq("id", user.id)
      .or(orFilter)
      .order("full_name");
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  }

  if (role === "staff") {
    // Get the staff_profile_id for this user, then their assigned client profile_ids
    const admin = getAdminClient();
    const { data: sp } = await admin
      .from("staff_profiles")
      .select("id")
      .eq("profile_id", user.id)
      .single();

    const clientIds = sp
      ? ((await admin.from("appointments").select("client_id").eq("staff_profile_id", sp.id)).data ?? []).map(
          (a) => a.client_id,
        )
      : [];

    const orFilter = clientIds.length ? `role.eq.admin,id.in.(${clientIds.join(",")})` : "role.eq.admin";

    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, role")
      .eq("is_active", true)
      .neq("id", user.id)
      .or(orFilter)
      .order("full_name");
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  }

  return NextResponse.json({ data: [] });
});
