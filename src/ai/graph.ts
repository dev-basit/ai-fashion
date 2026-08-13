import { StateGraph, END } from "@langchain/langgraph";
import { AgentAnnotation } from "@/ai/state";
import { retrieve, generate } from "@/ai/rag";

export const graph = new StateGraph(AgentAnnotation)
  .addNode("retrieve", retrieve)
  .addNode("generate", generate)
  .addEdge("__start__", "retrieve")
  .addEdge("retrieve", "generate")
  .addEdge("generate", END)
  .compile();
