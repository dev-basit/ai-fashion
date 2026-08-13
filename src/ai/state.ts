import { Annotation, messagesStateReducer } from "@langchain/langgraph";
import type { BaseMessage } from "@langchain/core/messages";

export const AgentAnnotation = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: messagesStateReducer,
    default: () => [],
  }),
  userRole: Annotation<string>({
    reducer: (_, next) => next,
    default: () => "customer",
  }),
  context: Annotation<string>({
    reducer: (_, next) => next,
    default: () => "",
  }),
});

export type AgentState = typeof AgentAnnotation.State;
