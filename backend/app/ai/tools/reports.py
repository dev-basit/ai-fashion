from langchain_core.tools import tool
from app.services import appointments as appts_svc


@tool
def get_appointment_stats() -> str:
    """Get today's appointment count, pending count, and revenue. Admin only."""
    data = appts_svc.get_stats()
    return f"Today's appointments: {data['todayCount']}, Pending: {data['pendingCount']}, Today's revenue: {data['todayRevenue']}"


reports_tools = [get_appointment_stats]
