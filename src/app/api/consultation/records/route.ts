import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { withAuth } from "@/lib/api-handlers";
import { notifyUserAndAdmins } from "@/lib/notify";

export const GET = withAuth(async (request: NextRequest, { supabase }) => {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("clientId");

  let query = supabase
    .from("consultation_records")
    .select("*, profiles!client_id(id, full_name), consultation_form_templates(name)")
    .order("created_at", { ascending: false });
  if (clientId) query = query.eq("client_id", clientId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
});

export const POST = withAuth(async (request: NextRequest, { user, supabase }) => {
  const body = await request.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await supabase
    .from("consultation_records")
    .insert(body as any)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const clientId: string | null = body.client_id ?? null;
  if (clientId) {
    const { data: clientProfile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", clientId)
      .single();
    const clientName = clientProfile?.full_name ?? "A client";

    // Notify client (exclude if they submitted it themselves)
    await notifyUserAndAdmins(clientId !== user.id ? clientId : null, {
      type: "system",
      title: "Consultation record created",
      body: "A consultation record has been created for you. You can view it in your profile.",
      data: { record_id: (data as { id: string }).id },
    });

    // Admins always get notified
    await notifyUserAndAdmins(null, {
      type: "system",
      title: "New consultation record",
      body: `A consultation record was created for ${clientName}.`,
      data: { record_id: (data as { id: string }).id },
    });
  }

  return NextResponse.json({ data }, { status: 201 });
});
