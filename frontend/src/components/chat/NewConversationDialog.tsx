"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useChatRecipients, useCreateConversation } from "@/hooks/useChat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatInitials } from "@/utils/format";
import type { NewConversationDialogProps } from "@/types/props";
import type { Profile } from "@/types/database";

export function NewConversationDialog({ onCreated, onCancel }: NewConversationDialogProps) {
  const [search, setSearch] = useState("");
  const { data: recipientsRaw, isLoading: loading } = useChatRecipients();
  const recipients = (recipientsRaw ?? []) as Profile[];
  const [creating, setCreating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const createConversation = useCreateConversation();

  const filtered = search
    ? recipients.filter((r) => r.full_name?.toLowerCase().includes(search.toLowerCase()))
    : recipients;

  const startConversation = async (recipientId: string) => {
    setError(null);
    setCreating(recipientId);
    try {
      const conv = await createConversation.mutateAsync(recipientId);
      if (conv?.id) {
        onCreated(conv.id);
      } else {
        setError("Failed to open conversation");
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
