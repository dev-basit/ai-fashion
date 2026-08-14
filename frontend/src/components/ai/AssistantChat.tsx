"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Bot, User, Loader2, AlertCircle, Plus, Trash2, MessageSquare, ChevronLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, toAIChatMessage, relativeTime } from "@/lib/utils";
import type { AIChatMessage } from "@/types/props";
import type { AiConversation, AiMessage } from "@/types/database";
import { SUGGESTED_QUESTIONS } from "@/config/ai";
import { aiConversationsService } from "@/services/ai-conversations.service";
import { getBrowserClient } from "@/services/supabase";
import { useAIStore } from "@/store/ai.store";
import { useAuth } from "@/hooks/useAuth";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function AssistantChat() {
  const { user } = useAuth();
  const { activeConversationId, setActiveConversationId } = useAIStore();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [conversations, setConversations] = useState<AiConversation[]>([]);
  const [isLoadingConvs, setIsLoadingConvs] = useState(true);
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [limit, setLimit] = useState<number | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load conversations on mount
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await aiConversationsService.getConversations();
        if (data) setConversations(data as unknown as AiConversation[]);
      } finally {
        setIsLoadingConvs(false);
      }
    };
    load();
  }, []);

  // Load messages when active conversation changes
  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      return;
    }
    setIsLoadingMessages(true);
    const load = async () => {
      try {
        const { data } = await aiConversationsService.getMessages(activeConversationId);
        if (data) setMessages((data as unknown as AiMessage[]).map(toAIChatMessage));
      } finally {
        setIsLoadingMessages(false);
      }
    };
    load();
  }, [activeConversationId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const isRateLimited = remaining !== null && remaining <= 0;

  const handleNewChat = useCallback(async () => {
    if (!user) return;
    const { data, error } = await aiConversationsService.createConversation();
    if (error || !data) return;
    setConversations((prev) => [data as AiConversation, ...prev]);
    setActiveConversationId(data.id);
    setMessages([]);
    setInput("");
    setSidebarOpen(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [user, setActiveConversationId]);

  const handleSelectConversation = useCallback(
    (id: string) => {
      if (id === activeConversationId) return;
      setActiveConversationId(id);
      setInput("");
      setSidebarOpen(false); // auto-collapse on small screens; lg:flex keeps it visible on desktop
    },
    [activeConversationId, setActiveConversationId],
  );

  const handleDelete = useCallback(
    async (conversationId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      await aiConversationsService.deleteConversation(conversationId);
      setConversations((prev) => prev.filter((c) => c.id !== conversationId));
      if (activeConversationId === conversationId) {
        setActiveConversationId(null);
        setMessages([]);
      }
    },
    [activeConversationId, setActiveConversationId],
  );

  const send = useCallback(
    async (text?: string) => {
      const message = (text ?? input).trim();
      if (!message || isStreaming || isRateLimited || !activeConversationId) return;

      setInput("");

      const isFirstMessage = messages.length === 0;

      // Optimistic UI: add user + empty assistant messages
      const userMsg: AIChatMessage = { id: crypto.randomUUID(), role: "user", content: message };
      const assistantId = crypto.randomUUID();
      const assistantMsg: AIChatMessage = { id: assistantId, role: "assistant", content: "" };
      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsStreaming(true);

      // Optimistically update sidebar title + bump to top
      if (isFirstMessage) {
        const title = message.slice(0, 50).trim();
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeConversationId ? { ...c, title, updated_at: new Date().toISOString() } : c,
          ),
        );
      } else {
        setConversations((prev) => {
          const hit = prev.find((c) => c.id === activeConversationId);
          if (!hit) return prev;
          return [
            { ...hit, updated_at: new Date().toISOString() },
            ...prev.filter((c) => c.id !== activeConversationId),
          ];
        });
      }

      try {
        const { data: { session } } = await getBrowserClient().auth.getSession();
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";
        const res = await fetch(`${backendUrl}/ai/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
          },
          body: JSON.stringify({
            message,
            conversationId: activeConversationId,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          }),
        });

        const headerLimit = res.headers.get("X-RateLimit-Limit");
        const headerRemaining = res.headers.get("X-RateLimit-Remaining");
        if (headerLimit) setLimit(parseInt(headerLimit, 10));
        if (headerRemaining) setRemaining(parseInt(headerRemaining, 10));

        if (res.status === 429) {
          const body = await res.json();
          const errMsg = body?.detail?.message ?? "Daily AI limit reached. Resets at midnight.";
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: errMsg, isError: true } : m)),
          );
          return;
        }

        if (!res.ok || !res.body) throw new Error("Failed to get response");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const token = decoder.decode(value, { stream: true });
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + token } : m)),
          );
        }
      } catch {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: "Sorry, I couldn't process your request. Please try again.", isError: true }
              : m,
          ),
        );
      } finally {
        setIsStreaming(false);
        inputRef.current?.focus();
      }
    },
    [input, isStreaming, isRateLimited, activeConversationId, messages.length],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const usageColor =
    remaining === null
      ? "text-muted-foreground"
      : remaining <= 3
        ? "text-destructive"
        : remaining <= 8
          ? "text-amber-500 dark:text-amber-400"
          : "text-muted-foreground";

  return (
    <div className="flex flex-1 min-h-0 rounded-xl border border-border bg-card overflow-hidden mt-4">
      {/* ── Sidebar ── */}
      <div
        className={cn(
          "border-r border-border flex flex-col flex-shrink-0 h-full overflow-hidden",
          "lg:flex lg:w-60",
          sidebarOpen ? "flex w-full" : "hidden",
        )}
      >
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Conversations
          </span>
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={handleNewChat}
              title="New conversation"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 lg:hidden"
              onClick={() => setSidebarOpen(false)}
              title="Close sidebar"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoadingConvs ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center gap-2">
              <MessageSquare className="h-6 w-6 text-muted-foreground/50" />
              <p className="text-xs text-muted-foreground">No conversations yet. Click + to start.</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                role="button"
                tabIndex={0}
                onClick={() => handleSelectConversation(conv.id)}
                onKeyDown={(e) => e.key === "Enter" && handleSelectConversation(conv.id)}
                className={cn(
                  "group w-full text-left px-3 py-2.5 flex flex-col gap-0.5 hover:bg-accent transition-colors cursor-pointer",
                  activeConversationId === conv.id && "bg-accent",
                )}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-sm font-medium truncate flex-1 leading-snug">
                    {conv.title ?? "New chat"}
                  </span>
                  <button
                    onClick={(e) => handleDelete(conv.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:text-destructive transition-opacity flex-shrink-0"
                    title="Delete conversation"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <span className="text-[11px] text-muted-foreground leading-none">
                  {relativeTime(conv.updated_at)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Chat panel ── */}
      <div className={cn("flex flex-col flex-1 min-w-0", sidebarOpen ? "hidden lg:flex" : "flex")}>
        {/* Back button — visible only below lg */}
        <div className="lg:hidden flex items-center gap-1 px-3 py-2 border-b border-border flex-shrink-0">
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setSidebarOpen(true)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">Conversations</span>
        </div>

        {!activeConversationId ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-4 text-center px-6">
            <div className="rounded-full bg-primary/10 p-4">
              <Bot className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Glow By Miral Assistant</p>
              <p className="text-sm text-muted-foreground mt-1">Select a conversation or start a new one.</p>
            </div>
            <Button variant="outline" onClick={handleNewChat} className="gap-2">
              <Plus className="h-4 w-4" />
              New Conversation
            </Button>
          </div>
        ) : (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {isLoadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-6 text-center py-12">
                  <div className="rounded-full bg-primary/10 p-4">
                    <Bot className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Ask me anything</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Appointments, policies, services, and more.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                    {SUGGESTED_QUESTIONS.map((q) => (
                      <button
                        key={q}
                        onClick={() => send(q)}
                        className="text-left text-sm px-3 py-2.5 rounded-lg border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn("flex gap-3 max-w-3xl", msg.role === "user" ? "ml-auto flex-row-reverse" : "")}
                  >
                    <div
                      className={cn(
                        "flex-shrink-0 rounded-full h-8 w-8 flex items-center justify-center",
                        msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted",
                      )}
                    >
                      {msg.role === "user" ? (
                        <User className="h-4 w-4" />
                      ) : msg.isError ? (
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </div>

                    <div
                      className={cn(
                        "rounded-2xl px-4 py-2.5 text-sm leading-relaxed max-w-[75%]",
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-tr-sm"
                          : msg.isError
                            ? "bg-destructive/10 text-destructive border border-destructive/20 rounded-tl-sm"
                            : "bg-muted text-foreground rounded-tl-sm",
                      )}
                    >
                      {msg.content ? (
                        msg.role === "assistant" && !msg.isError ? (
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                              ul: ({ children }) => (
                                <ul className="list-disc pl-4 mb-2 space-y-0.5">{children}</ul>
                              ),
                              ol: ({ children }) => (
                                <ol className="list-decimal pl-4 mb-2 space-y-0.5">{children}</ol>
                              ),
                              li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                              strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                              em: ({ children }) => <em className="italic">{children}</em>,
                              h1: ({ children }) => (
                                <h1 className="text-base font-semibold mb-1 mt-2 first:mt-0">{children}</h1>
                              ),
                              h2: ({ children }) => (
                                <h2 className="text-sm font-semibold mb-1 mt-2 first:mt-0">{children}</h2>
                              ),
                              h3: ({ children }) => (
                                <h3 className="text-sm font-medium mb-1 mt-2 first:mt-0">{children}</h3>
                              ),
                              code: ({ children, className }) => {
                                const isBlock = className?.includes("language-");
                                return isBlock ? (
                                  <code className="block bg-background/60 border border-border rounded-md px-3 py-2 font-mono text-xs my-2 whitespace-pre-wrap overflow-x-auto">
                                    {children}
                                  </code>
                                ) : (
                                  <code className="bg-background/60 border border-border rounded px-1 py-0.5 font-mono text-xs">
                                    {children}
                                  </code>
                                );
                              },
                              pre: ({ children }) => <pre className="not-prose">{children}</pre>,
                              blockquote: ({ children }) => (
                                <blockquote className="border-l-2 border-border pl-3 text-muted-foreground italic my-2">
                                  {children}
                                </blockquote>
                              ),
                              a: ({ href, children }) => (
                                <a
                                  href={href}
                                  className="underline underline-offset-2 hover:opacity-80"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {children}
                                </a>
                              ),
                              table: ({ children }) => (
                                <div className="overflow-x-auto my-2">
                                  <table className="text-xs border-collapse w-full">{children}</table>
                                </div>
                              ),
                              th: ({ children }) => (
                                <th className="border border-border bg-background/60 px-2 py-1 text-left font-semibold">
                                  {children}
                                </th>
                              ),
                              td: ({ children }) => <td className="border border-border px-2 py-1">{children}</td>,
                              hr: () => <hr className="border-border my-2" />,
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        ) : (
                          msg.content
                        )
                      ) : (
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Thinking…
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input bar */}
            <div className="border-t border-border bg-background">
              {isRateLimited && (
                <div className="flex items-center gap-2 px-4 py-2 bg-destructive/10 border-b border-destructive/20">
                  <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                  <p className="text-xs text-destructive">
                    Daily limit of {limit} calls reached. Resets at midnight.
                  </p>
                </div>
              )}
              <div className="flex gap-2 items-end p-3">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isRateLimited ? "Daily limit reached…" : "Ask me anything…"}
                  rows={1}
                  disabled={isStreaming || isRateLimited}
                  className={cn(
                    "flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground",
                    "min-h-[36px] max-h-32 py-2 px-1 leading-relaxed",
                  )}
                  style={{ height: "auto" }}
                  onInput={(e) => {
                    const t = e.currentTarget;
                    t.style.height = "auto";
                    t.style.height = `${Math.min(t.scrollHeight, 128)}px`;
                  }}
                />
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  {remaining !== null && limit !== null && (
                    <span className={cn("text-[10px] leading-none", usageColor)}>
                      {remaining}/{limit} left
                    </span>
                  )}
                  <Button
                    size="icon"
                    onClick={() => send()}
                    disabled={!input.trim() || isStreaming || isRateLimited}
                    className="h-9 w-9 rounded-xl"
                  >
                    {isStreaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
