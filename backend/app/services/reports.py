from typing import Any, cast

from app.core.context import get_db


def get_report(report_type: str, from_: str, to: str) -> dict | list:
    db = get_db()

    if report_type == "revenue":
        return db.table("appointments").select("price, discount, status, starts_at").eq("status", "completed").eq("payment_status", "paid").gte("starts_at", from_).lte("starts_at", to).execute().data or []

    if report_type == "appointments":
        return db.table("appointments").select("status, starts_at, service_id, services(name)").gte("starts_at", from_).lte("starts_at", to).execute().data or []

    if report_type == "clients":
        return db.table("profiles").select("id, created_at, role").eq("role", "customer").gte("created_at", from_).lte("created_at", to).execute().data or []

    if report_type == "staff":
        return db.table("appointments").select("staff_profile_id, status, price, staff_profiles(profiles(full_name))").eq("status", "completed").gte("starts_at", from_).lte("starts_at", to).not_.is_("staff_profile_id", "null").execute().data or []

    if report_type == "orders":
        return db.table("orders").select("total_amount, created_at").not_.in_("status", ["cancelled", "refunded"]).gte("created_at", from_).lte("created_at", to).execute().data or []

    if report_type == "products":
        return db.table("order_items").select("quantity, unit_price, product_id, products(name), orders!inner(status, created_at)").eq("orders.status", "delivered").gte("orders.created_at", from_).lte("orders.created_at", to).execute().data or []

    if report_type == "dashboard":
        range_appointments = db.table("appointments").select("id, status", count="exact").gte("starts_at", from_).lte("starts_at", to).execute()
        pending_count = db.table("appointments").select("id", count="exact", head=True).eq("status", "pending").execute().count or 0
        total_clients = db.table("profiles").select("id", count="exact", head=True).eq("role", "customer").eq("is_active", True).execute().count or 0
        _rev_res = db.table("appointments").select("price, discount").eq("status", "completed").eq("payment_status", "paid").gte("starts_at", from_).lte("starts_at", to).execute()
        range_revenue: list[dict[str, Any]] = cast(list[dict[str, Any]], _rev_res.data or [])
        _ord_res = db.table("orders").select("total_amount").not_.in_("status", ["cancelled", "refunded"]).gte("created_at", from_).lte("created_at", to).execute()
        range_orders: list[dict[str, Any]] = cast(list[dict[str, Any]], _ord_res.data or [])

        appt_revenue = sum((r.get("price", 0) or 0) - (r.get("discount", 0) or 0) for r in range_revenue)
        order_revenue = sum(o.get("total_amount", 0) or 0 for o in range_orders)

        return {
            "appointmentsCount": range_appointments.count or 0,
            "pendingAppointmentsCount": pending_count,
            "totalClientsCount": total_clients,
            "appointmentRevenue": appt_revenue,
            "orderRevenue": order_revenue,
            "revenue": appt_revenue + order_revenue,
        }

    raise ValueError(f"Invalid report type: {report_type}")
