import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { withAuth } from "@/lib/api-handlers";
import { notifyUserAndAdmins } from "@/lib/notify";

export const GET = withAuth(async (request: NextRequest, { user, supabase }) => {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("clientId");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const role = profile?.role;

  let query = supabase
    .from("client_treatment_plans")
    .select("*, profiles!client_id(id, full_name, avatar_url), treatment_plan_templates(name, duration_days)")
    .order("created_at", { ascending: false });

  if (role === "customer") {
    query = query.eq("client_id", user.id);
  } else if (clientId) {
    query = query.eq("client_id", clientId);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
});

export const POST = withAuth(async (request: NextRequest, { user, supabase }) => {
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role === "customer") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await supabase
    .from("client_treatment_plans")
    .insert(body as any)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const clientId: string | null = body.client_id ?? null;
  if (clientId) {
    const [clientRes, templateRes] = await Promise.all([
      supabase.from("profiles").select("full_name").eq("id", clientId).single(),
      body.template_id
        ? supabase.from("treatment_plan_templates").select("name").eq("id", body.template_id).single()
        : null,
    ]);
    const clientName = clientRes.data?.full_name ?? "A client";
    const planName = templateRes?.data?.name ?? "a treatment plan";

    await notifyUserAndAdmins(clientId, {
      type: "system",
      title: "Treatment plan assigned",
      body: `You have been assigned "${planName}". Check your treatment plans to get started.`,
      data: { plan_id: (data as { id: string }).id },
    });

    await notifyUserAndAdmins(null, {
      type: "system",
      title: "Treatment plan assigned",
      body: `${planName} was assigned to ${clientName}.`,
      data: { plan_id: (data as { id: string }).id },
    });
  }

  return NextResponse.json({ data }, { status: 201 });
});
