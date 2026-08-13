import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { withAuth } from "@/lib/api-handlers";
import { notifyUserAndAdmins } from "@/lib/notify";

export const GET = withAuth(async (request: NextRequest, { supabase }) => {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("clientId");
  const staffProfileId = searchParams.get("staffProfileId");
  const status = searchParams.get("status");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  let query = supabase
    .from("appointments")
    .select(
      "*, services(id, name, duration_mins, base_price), profiles!client_id(id, full_name), staff_profiles(id, profiles(id, full_name))",
    )
    .order("starts_at", { ascending: false });

  if (clientId) query = query.eq("client_id", clientId);
  if (staffProfileId) query = query.eq("staff_profile_id", staffProfileId);
  if (status)
    query = query.eq(
      "status",
      status as "pending" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show",
    );
  if (from) query = query.gte("starts_at", from);
  if (to) query = query.lte("starts_at", to);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
});

export const POST = withAuth(async (request: NextRequest, { user, supabase }) => {
  const body = await request.json();
  const { data, error } = await supabase.from("appointments").insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const apt = data as {
    id: string;
    client_id: string;
    staff_profile_id: string | null;
    service_id: string | null;
    starts_at: string;
  };

  const [serviceRes, clientRes, staffRes] = await Promise.all([
    apt.service_id ? supabase.from("services").select("name").eq("id", apt.service_id).single() : null,
    supabase.from("profiles").select("full_name").eq("id", apt.client_id).single(),
    apt.staff_profile_id
      ? supabase.from("staff_profiles").select("profile_id").eq("id", apt.staff_profile_id).single()
      : null,
  ]);

  const serviceName = serviceRes?.data?.name ?? "appointment";
  const clientName = clientRes?.data?.full_name ?? "A client";
  const staffProfileId = staffRes?.data?.profile_id ?? null;

  if (staffProfileId) {
    await notifyUserAndAdmins(
      staffProfileId,
      {
        type: "appointment",
        title: "New appointment booked",
        body: `${clientName} booked a ${serviceName} appointment.`,
        data: { appointment_id: apt.id },
      },
      user.id,
    );
  } else {
    await notifyUserAndAdmins(
      null,
      {
        type: "appointment",
        title: "New appointment booked",
        body: `${clientName} booked a ${serviceName} appointment.`,
        data: { appointment_id: apt.id },
      },
      user.id,
    );
  }

  return NextResponse.json({ data }, { status: 201 });
});
