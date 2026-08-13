import { PageHeader } from "@/components/common/PageHeader";
import { AssistantChat } from "@/components/ai/AssistantChat";

export default function AIAssistantPage() {
  return (
    <div className="flex flex-col h-full">
      {/* <PageHeader
        title="AI Assistant"
        description="Ask me about appointments, policies, services, and more."
      /> */}
      <AssistantChat />
    </div>
  );
}
