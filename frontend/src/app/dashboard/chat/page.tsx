"use client";

import { useAuth } from "@/hooks/useAuth";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ChatView } from "@/components/chat/ChatView";

export default function ChatPage() {
  const { user, profile, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner />;

  return <ChatView userId={user!.id} userRole={profile?.role ?? "customer"} />;
}
