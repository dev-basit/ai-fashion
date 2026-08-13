import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-handlers";

export const GET = withAuth(async (_request, { supabase }, { params }) => {
  const { id } = await params;
  const { data, error } = await supabase
    .from("messages")
    .select("*, profiles!sender_id(id, full_name, avatar_url)")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true })
    .limit(100);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
});

export const POST = withAuth(async (request, { user, supabase }, { params }) => {
  const { id } = await params;
  const { content } = await request.json();
  const { data, error } = await supabase
    .from("messages")
    .insert({ conversation_id: id, sender_id: user.id, content, message_type: "text" })
    .select("*, profiles!sender_id(id, full_name, avatar_url)")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
});
