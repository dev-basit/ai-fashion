"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { getBrowserClient } from "@/services/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatInitials } from "@/utils/format";
import type { NewConversationDialogProps } from "@/types/props";
import type { Profile } from "@/types/database";


export function NewConversationDialog({ userId, userRole, onCreated, onCancel }: NewConversationDialogProps) {
  const [search, setSearch] = useState("");
  const [recipients, setRecipients] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = getBrowserClient();
      let query = supabase
        .from("profiles")
        .select("id, full_name, avatar_url, role")
        .eq("is_active", true)
        .neq("id", userId);

      if (userRole === "customer") {
        // Customer: only staff and admin they've had appointments with, plus all admins
        const { data: apts } = await supabase
          .from("appointments")
          .select("staff_profile_id, staff_profiles(profile_id)")
          .eq("client_id", userId);

        const staffProfileIds = (apts ?? [])
          .map((a) => (a.staff_profiles as { profile_id: string } | null)?.profile_id)
          .filter(Boolean) as string[];

        query = supabase
          .from("profiles")
          .select("id, full_name, avatar_url, role")
          .eq("is_active", true)
          .neq("id", userId)
          .or(`role.eq.admin,id.in.(${staffProfileIds.length ? staffProfileIds.join(",") : "null"})`);
      } else if (userRole === "staff") {
        // Staff: assigned clients + admins
        const { data: apts } = await supabase
          .from("appointments")
          .select("client_id")
          .not("staff_profile_id", "is", null);

        const staffResult = await supabase.from("staff_profiles").select("id").eq("profile_id", userId).single();
        const staffProfileId = staffResult.data?.id;

        const clientIds = staffProfileId
          ? (
              (await supabase.from("appointments").select("client_id").eq("staff_profile_id", staffProfileId))
                .data ?? []
            ).map((a) => a.client_id)
          : [];

        query = supabase
          .from("profiles")
          .select("id, full_name, avatar_url, role")
          .eq("is_active", true)
          .neq("id", userId)
          .or(`role.eq.admin,id.in.(${clientIds.length ? clientIds.join(",") : "null"})`);
      }
      // admin: can message anyone — no additional filter

      const { data } = await query.order("full_name");
      setRecipients((data ?? []) as Profile[]);
      setLoading(false);
    }
    load();
  }, [userId, userRole]);

  const filtered = search
    ? recipients.filter((r) => r.full_name?.toLowerCase().includes(search.toLowerCase()))
    : recipients;

  const startConversation = async (recipientId: string) => {
    setError(null);
    setCreating(recipientId);
    try {
      const res = await fetch("/api/chat/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientId })
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.data?.id) {
        onCreated(json.data.id);
      } else {
        setError(json.error ?? `Failed to open conversation (${res.status})`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setCreating(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

      <div className="max-h-64 overflow-y-auto space-y-1">
        {loading && <p className="text-sm text-muted-foreground text-center py-4">Loading...</p>}
        {!loading && filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">No available recipients</p>
        )}
        {filtered.map((r) => (
          <button
            key={r.id}
            onClick={() => startConversation(r.id)}
            disabled={creating === r.id}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left disabled:opacity-50"
          >
            <Avatar className="h-9 w-9 flex-shrink-0">
              <AvatarImage src={r.avatar_url ?? undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {formatInitials(r.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{r.full_name ?? "Unknown"}</p>
              <p className="text-xs text-muted-foreground capitalize">{r.role}</p>
            </div>
            {creating === r.id && <span className="text-xs text-muted-foreground ml-auto">Opening...</span>}
          </button>
        ))}
      </div>

      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
