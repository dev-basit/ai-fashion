"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, Plus, Send, ChevronLeft, X } from "lucide-react";
import { useConversations, useMessages } from "@/hooks/useChat";
import { useChatStore } from "@/store/chat.store";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { NewConversationDialog } from "./NewConversationDialog";
import { cn } from "@/lib/utils";
import { formatRelativeDate } from "@/utils/date";
import { formatInitials } from "@/utils/format";
import type { ChatViewProps } from "@/types/props";
import type { Message } from "@/types/database";

function ConversationList({ userId, onSelect }: { userId: string; onSelect: (id: string) => void }) {
  const { conversations } = useConversations();
  const { activeConversationId } = useChatStore();

  if (conversations.length === 0) {
    return <p className="p-4 text-sm text-muted-foreground text-center">No conversations yet</p>;
  }

  return (
    <div className="divide-y divide-border">
      {conversations.map((conv) => {
        const participants =
          (
            conv as typeof conv & {
              conversation_participants?: Array<{
                profile_id: string;
                profiles?: { full_name?: string; avatar_url?: string | null };
              }>;
            }
          ).conversation_participants ?? [];
        const other = participants.find((p) => p.profile_id !== userId);
        const name = conv.is_group ? (conv.title ?? "Group") : (other?.profiles?.full_name ?? "User");
        return (
          <button
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={cn(
              "w-full text-left p-4 hover:bg-accent transition-colors",
              activeConversationId === conv.id && "bg-accent",
            )}
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarImage src={other?.profiles?.avatar_url ?? undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {formatInitials(name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{name}</p>
                <p className="text-xs text-muted-foreground">{formatRelativeDate(conv.updated_at)}</p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function ChatWindow({
  conversationId,
  userId,
  onBack,
}: {
  conversationId: string;
  userId: string;
  onBack: () => void;
}) {
  const { messages, sendMessage } = useMessages(conversationId);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    await sendMessage(input.trim());
    setInput("");
    setSending(false);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Back button — visible only on screens smaller than lg */}
      <div className="lg:hidden flex items-center gap-1 px-3 py-2 border-b border-border flex-shrink-0">
        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onBack}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium">Conversations</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {messages.map((msg) => {
            const extMsg = msg as Message & { profiles?: { full_name?: string; avatar_url?: string | null } };
            const isOwn = msg.sender_id === userId;
            return (
              <div key={msg.id} className={cn("flex gap-2", isOwn && "flex-row-reverse")}>
                {!isOwn && (
                  <Avatar className="h-7 w-7 flex-shrink-0">
                    <AvatarImage src={extMsg.profiles?.avatar_url ?? undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {formatInitials(extMsg.profiles?.full_name)}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "max-w-[70%] rounded-2xl px-4 py-2 text-sm",
                    isOwn
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-muted text-foreground rounded-bl-sm",
                  )}
                >
                  <p>{msg.content}</p>
                  <p
                    className={cn(
                      "text-[10px] mt-1",
                      isOwn ? "text-primary-foreground/70" : "text-muted-foreground",
                    )}
                  >
                    {formatRelativeDate(msg.created_at)}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="border-t border-border p-4 flex gap-2">
        <Input
          ref={inputRef}
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          disabled={sending}
          className="flex-1"
        />
        <Button size="icon" onClick={handleSend} disabled={!input.trim() || sending}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function ChatView({ userId, userRole }: ChatViewProps) {
  const { setActiveConversation, activeConversationId } = useChatStore();
  const { refetch } = useConversations();
  const [showNewConv, setShowNewConv] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleSelectConversation = (id: string) => {
    setActiveConversation(id);
    setSidebarOpen(false); // auto-collapse on small screens; lg:flex keeps it visible on desktop
  };

  return (
    <div className="space-y-4">
      <div
        className="flex border border-border rounded-lg overflow-hidden"
        style={{ height: "calc(100vh - 120px)", minHeight: "400px" }}
      >
        {/* Conversation list */}
        <div
          className={cn(
            "border-r border-border flex flex-col h-full overflow-hidden flex-shrink-0",
            "lg:flex lg:w-72",
            sidebarOpen ? "flex w-full" : "hidden",
          )}
        >
          <div className="flex-shrink-0 p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-sm">Conversations</h3>
            <div className="flex items-center gap-1">
              <Button size="icon" variant="ghost" onClick={() => setShowNewConv(true)}>
                <Plus className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <ConversationList userId={userId} onSelect={handleSelectConversation} />
          </div>
        </div>

        {/* Chat window */}
        <div
          className={cn(
            "flex flex-col flex-1 min-w-0 h-full overflow-hidden",
            sidebarOpen ? "hidden lg:flex" : "flex",
          )}
        >
          {activeConversationId ? (
            <ChatWindow
              conversationId={activeConversationId}
              userId={userId}
              onBack={() => setSidebarOpen(true)}
            />
          ) : (
            <EmptyState
              icon={<MessageSquare className="h-12 w-12" />}
              title="Select a conversation"
              description="Choose a conversation from the left to start chatting."
            />
          )}
        </div>
      </div>

      <Dialog open={showNewConv} onOpenChange={setShowNewConv}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>New Conversation</DialogTitle>
          </DialogHeader>
          <NewConversationDialog
            onCreated={async (id) => {
              setShowNewConv(false);
              await refetch();
              setActiveConversation(id);
            }}
            onCancel={() => setShowNewConv(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
