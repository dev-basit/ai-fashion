from langgraph.graph import END, StateGraph
from langgraph.prebuilt import ToolNode

from app.ai.agent import agent, route_agent
from app.ai.rag import retrieve
from app.ai.state import AgentState
from app.ai.tools import all_tools

graph = (
    StateGraph(AgentState)
    .add_node("agent", agent)
    .add_node("retrieve", retrieve)
    .add_node("tools", ToolNode(all_tools))
    .add_edge("__start__", "agent")
    .add_conditional_edges("agent", route_agent, {"retrieve": "retrieve", "tools": "tools", END: END})
    .add_edge("retrieve", "agent")
    .add_edge("tools", "agent")
    .compile()
)
