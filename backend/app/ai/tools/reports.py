import json
from typing import Annotated

from langchain_core.runnables import RunnableConfig
from langchain_core.tools import InjectedToolArg, tool

from app.ai.tools.utils import get_supabase
from app.services import appointments as appts_svc


@tool
def get_appointment_stats(
    config: Annotated[RunnableConfig, InjectedToolArg] = None,
) -> str:
    """Get today's appointment count, pending count, and revenue. Admin only."""
    data = appts_svc.get_stats(get_supabase(config))
    return f"Today's appointments: {data['todayCount']}, Pending: {data['pendingCount']}, Today's revenue: {data['todayRevenue']}"


reports_tools = [get_appointment_stats]
