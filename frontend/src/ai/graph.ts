import { StateGraph, END } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { AgentAnnotation } from "@/ai/state";
import { agent, routeAgent } from "@/ai/agent";
import { retrieve } from "@/ai/rag";
import { allTools } from "@/ai/tools";

const toolNode = new ToolNode(allTools);

export const graph = new StateGraph(AgentAnnotation)
  .addNode("agent", agent)
  .addNode("retrieve", retrieve)
  .addNode("tools", toolNode)
  .addEdge("__start__", "agent")
  .addConditionalEdges("agent", routeAgent, {
    retrieve: "retrieve",
    tools: "tools",
    [END]: END,
  })
  .addEdge("retrieve", "agent")
  .addEdge("tools", "agent")
  .compile();
