import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-handlers";
import { getAdminClient } from "@/services/supabase-admin";

export const GET = withAuth(async (_request, { user }) => {
  // Explicit membership filter — no RLS. Get conversation IDs the user belongs to, then
  // fetch those conversations with ALL participants so the UI can show the other person's name.
  const admin = getAdminClient();

  const { data: memberships, error: mErr } = await admin
    .from("conversation_participants")
    .select("conversation_id")
    .eq("profile_id", user.id);
  if (mErr) return NextResponse.json({ error: mErr.message }, { status: 500 });

  const convIds = (memberships ?? []).map((m) => m.conversation_id);
  if (!convIds.length) return NextResponse.json({ data: [] });

  const { data, error } = await admin
    .from("conversations")
    .select("*, conversation_participants(profile_id, last_read_at, profiles(id, full_name, avatar_url))")
    .in("id", convIds)
    .order("updated_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
});

export const POST = withAuth(async (request, { user }) => {
  const { recipientId } = await request.json();
  if (!recipientId) return NextResponse.json({ error: "recipientId is required" }, { status: 400 });

  // Use admin client so participant inserts bypass RLS for all roles (customers included)
  const admin = getAdminClient();

  const { data: myParticipations } = await admin
    .from("conversation_participants")
    .select("conversation_id")
    .eq("profile_id", user.id);

  const myConvIds = (myParticipations ?? []).map((p) => p.conversation_id);

  if (myConvIds.length > 0) {
    const { data: shared } = await admin
      .from("conversation_participants")
      .select("conversation_id")
      .eq("profile_id", recipientId)
      .in("conversation_id", myConvIds);

    for (const row of shared ?? []) {
      const { data: conv } = await admin
        .from("conversations")
        .select("id")
        .eq("id", row.conversation_id)
        .eq("is_group", false)
        .single();
      if (conv) return NextResponse.json({ data: { id: conv.id } });
    }
  }

  const { data: conv, error: convErr } = await admin
    .from("conversations")
    .insert({ created_by: user.id, is_group: false })
    .select()
    .single();
  if (convErr || !conv)
    return NextResponse.json({ error: convErr?.message ?? "Failed to create conversation" }, { status: 500 });

  const { error: partErr } = await admin.from("conversation_participants").insert([
    { conversation_id: conv.id, profile_id: user.id },
    { conversation_id: conv.id, profile_id: recipientId },
  ]);
  if (partErr) return NextResponse.json({ error: partErr.message }, { status: 500 });

  return NextResponse.json({ data: { id: conv.id } }, { status: 201 });
});
