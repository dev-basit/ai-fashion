import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-handlers";
import { getAdminClient } from "@/services/supabase-admin";

async function isMember(conversationId: string, userId: string): Promise<boolean> {
  const { data } = await getAdminClient()
    .from("conversation_participants")
    .select("conversation_id")
    .eq("conversation_id", conversationId)
    .eq("profile_id", userId)
    .single();
  return !!data;
}

export const GET = withAuth(async (request, { user, supabase }, { params }) => {
  const { id } = await params;
  if (!(await isMember(id, user.id))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const limit = parseInt(new URL(request.url).searchParams.get("limit") ?? "50", 10);
  const { data, error } = await supabase
    .from("messages")
    .select("*, profiles!sender_id(id, full_name, avatar_url)")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true })
    .limit(limit);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
});

export const POST = withAuth(async (request, { user, supabase }, { params }) => {
  const { id } = await params;
  if (!(await isMember(id, user.id))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { content } = await request.json();
  const { data, error } = await supabase
    .from("messages")
    .insert({ conversation_id: id, sender_id: user.id, content, message_type: "text" })
    .select("*, profiles!sender_id(id, full_name, avatar_url)")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
});
