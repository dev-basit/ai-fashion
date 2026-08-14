import { getCurrentUserDetails } from "@/lib/auth";
import { ChatView } from "@/components/chat/ChatView";

export default async function ChatPage() {
  const { user, profile } = await getCurrentUserDetails();

  return <ChatView userId={user.id} userRole={profile?.role ?? "customer"} />;
}
