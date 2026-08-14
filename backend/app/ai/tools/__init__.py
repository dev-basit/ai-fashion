from app.ai.tools.my_profile import my_profile_tools
from app.ai.tools.appointments import customer_appointment_tools, staff_appointment_tools, admin_appointment_tools
from app.ai.tools.salon_services import shared_service_tools, admin_service_tools
from app.ai.tools.products import shared_product_tools, admin_product_tools
from app.ai.tools.orders import customer_order_tools, staff_order_tools, admin_order_tools
from app.ai.tools.clients import staff_client_tools, admin_client_tools
from app.ai.tools.staff import shared_staff_tools, admin_staff_tools
from app.ai.tools.consultation import customer_consultation_tools, staff_consultation_tools
from app.ai.tools.treatment_plans import customer_treatment_plan_tools, staff_treatment_plan_tools, admin_treatment_plan_tools
from app.ai.tools.settings import settings_tools
from app.ai.tools.reports import reports_tools

customer_tools = [
    *my_profile_tools,
    *customer_appointment_tools,
    *shared_service_tools,
    *shared_product_tools,
    *shared_staff_tools,
    *customer_order_tools,
    *customer_consultation_tools,
    *customer_treatment_plan_tools,
]

staff_tools = [
    *my_profile_tools,
    *staff_appointment_tools,
    *shared_service_tools,
    *shared_product_tools,
    *shared_staff_tools,
    *staff_order_tools,
    *staff_client_tools,
    *staff_consultation_tools,
    *staff_treatment_plan_tools,
]

admin_tools = [
    *my_profile_tools,
    *admin_appointment_tools,
    *admin_service_tools,
    *admin_product_tools,
    *admin_staff_tools,
    *admin_order_tools,
    *admin_client_tools,
    *staff_consultation_tools,
    *admin_treatment_plan_tools,
    *settings_tools,
    *reports_tools,
]


def get_role_tools(user_role: str) -> list:
    if user_role == "admin":
        return admin_tools
    if user_role == "staff":
        return staff_tools
    return customer_tools


all_tools = list({t.name: t for t in [*customer_tools, *staff_tools, *admin_tools]}.values())
