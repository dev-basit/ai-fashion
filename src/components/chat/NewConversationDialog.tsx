"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { chatService } from "@/services/chat.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatInitials } from "@/utils/format";
import type { NewConversationDialogProps } from "@/types/props";
import type { Profile } from "@/types/database";


export function NewConversationDialog({ onCreated, onCancel }: NewConversationDialogProps) {
  const [search, setSearch] = useState("");
  const [recipients, setRecipients] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data } = await chatService.getRecipients();
      setRecipients((data ?? []) as Profile[]);
      setLoading(false);
    }
    load();
  }, []);

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
      let json: Record<string, unknown> = {};
      try { json = await res.json(); } catch { /* ignore */ }
      if (res.ok && (json.data as Record<string, unknown>)?.id) {
        onCreated((json.data as Record<string, unknown>).id as string);
      } else {
        setError((json.error as string) ?? `Failed to open conversation (${res.status})`);
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
