from langchain_core.messages import AIMessage, ToolMessage

from app.ai.models import embeddings
from app.ai.state import AgentState
from app.services.ai_service import match_documents


async def retrieve(state: AgentState) -> dict:
    last_msg = state["messages"][-1] if state["messages"] else None
    if not isinstance(last_msg, AIMessage) or not last_msg.tool_calls:
        return {"messages": [], "context": ""}

    call = next((tc for tc in last_msg.tool_calls if tc["name"] == "retrieve_context"), None)
    if not call:
        return {"messages": [], "context": ""}

    query = (call.get("args") or {}).get("query", "")
    vectors = await embeddings.aembed_documents([query])
    chunks = match_documents(vectors[0], state.get("user_role", "customer"), 5)
    context = "\n\n".join(f"[{c['section']}]\n{c['content']}" for c in chunks) or "No relevant information found."

    tool_msg = ToolMessage(
        content=context,
        tool_call_id=call.get("id") or "retrieve_context",
        name="retrieve_context",
    )
    return {"messages": [tool_msg], "context": context}
