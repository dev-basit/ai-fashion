import json
import uuid
from typing import Annotated, Optional
from langchain_core.tools import tool

from app.services import consultation as consultation_svc


@tool
def get_my_consultation_records() -> str:
    """Get the current customer's own consultation records."""
    from app.core.context import get_current_user

    user_id = get_current_user().id
    data = consultation_svc.list_records(client_id=user_id)
    if not data:
        return "You have no consultation records."
    return json.dumps(
        [{"id": r["id"], "template": (r.get("consultation_form_templates") or {}).get("name"), "notes": r.get("notes"), "created_at": r.get("created_at")} for r in data],
        indent=2,
    )


@tool
def get_consultation_records(
    client_id: Annotated[Optional[str], "Filter by client profile UUID"] = None,
) -> str:
    """List consultation records. Optionally filter by a specific client."""
    data = consultation_svc.list_records(client_id=client_id)
    if not data:
        return "No consultation records found."
    return json.dumps(
        [{"id": r["id"], "client": (r.get("profiles") or {}).get("full_name"), "template": (r.get("consultation_form_templates") or {}).get("name"), "notes": r.get("notes"), "created_at": r.get("created_at")} for r in data],
        indent=2,
    )

@tool
def create_consultation_record(
    template_id: Annotated[str, "UUID of the consultation form template"],
    responses: Annotated[dict, "Field responses: can be {field_id: answer} or {question_label: answer} or {field_index: answer}"],
    client_id: Annotated[Optional[str], "UUID of the client (auto-filled for customers)"] = None,
    observations: Annotated[Optional[str], "Session notes (multiline text)"] = None,
    recommendations: Annotated[Optional[str], "Recommendations as multiline text (will be split into list)"] = None,
) -> str:
    """Create consultation record. Tool automatically converts plain text to proper format.

    Accepts flexible input formats and auto-converts:
    - responses: {field_id: answer} or {label: answer} or [answer1, answer2, ...]
    - recommendations: multiline text or list (auto-converts to list)

    For CUSTOMERS: Auto-uses their own ID.
    For STAFF/ADMIN: Must provide client_id.
    """
    try:
        from app.core.context import get_current_user, get_db
        from datetime import datetime

        user = get_current_user()
        user_role = get_db().table("profiles").select("role").eq("id", user.id).maybe_single().execute()
        role = (user_role.data or {}).get("role") if user_role else None

        # Auto-fill client_id for customers
        final_client_id = client_id
        if role == "customer" and not client_id:
            final_client_id = user.id

        if not final_client_id:
            return "Error: client_id is required for staff and admin."

        if not responses or len(responses) == 0:
            return "Error: No field responses provided."

        # Fetch template to map responses to field_ids
        template_data = consultation_svc.get_template(template_id)
        if not template_data:
            return f"Error: Template {template_id} not found."

        fields = template_data.fields or []

        # Convert responses to {field_id: answer} format
        final_responses = {}
        label_to_id = {field.label: field.id for field in fields}
        id_set = {field.id for field in fields}

        if isinstance(responses, dict):
            for key, value in responses.items():
                # Try direct field_id match
                if key in id_set:
                    final_responses[key] = value
                # Try label match
                elif key in label_to_id:
                    final_responses[label_to_id[key]] = value
                # Try partial label match
                else:
                    for label, field_id in label_to_id.items():
                        if key.lower() in label.lower() or label.lower() in key.lower():
                            final_responses[field_id] = value
                            break
        elif isinstance(responses, list):
            # Map by order: [answer1, answer2, ...]
            for idx, answer in enumerate(responses):
                if idx < len(fields):
                    final_responses[fields[idx].id] = answer

        if not final_responses:
            return f"Error: Could not map responses to template fields."

        # Convert recommendations: split multiline string into list
        final_recommendations = None
        if recommendations:
            if isinstance(recommendations, str):
                lines = [r.strip() for r in recommendations.split('\n') if r.strip()]
                final_recommendations = lines if lines else None
            elif isinstance(recommendations, list):
                final_recommendations = recommendations

        staff_profile_id = None
        if role == "staff":
            sp = get_db().table("staff_profiles").select("id").eq("profile_id", user.id).maybe_single().execute()
            staff_profile_id = (sp.data or {}).get("id") if sp else None

        body = {
            "client_id": final_client_id,
            "template_id": template_id,
            "staff_profile_id": staff_profile_id,
            "responses": final_responses,
            "observations": observations if observations and observations.strip() else None,
            "recommendations": final_recommendations,
            "submitted_at": datetime.utcnow().isoformat()
        }
        body = {k: v for k, v in body.items() if v is not None}
        consultation_svc.create_record(body)
        return f"✓ Consultation record created successfully with {len(final_responses)} field response(s)."
    except Exception as e:
        return f"Failed to create record: {str(e)}"


@tool
def list_consultation_templates() -> str:
    """List available consultation form templates that can be used when creating a consultation record."""
    data = consultation_svc.list_templates()
    if not data:
        return "No consultation templates available."
    return json.dumps(
        [{"id": t["id"], "name": t["name"], "fields": len(t.get("fields", []))} for t in data],
        indent=2,
    )


@tool
def prepare_consultation_template_for_responses(
    template_id: Annotated[str, "UUID of the consultation form template"],
) -> str:
    """Fetch template and display all questions that need to be answered.

    Use this BEFORE asking user for responses. Shows all questions clearly so user knows what to answer."""
    try:
        data = consultation_svc.get_template(template_id)
        if not data:
            return f"❌ Template '{template_id}' not found. Please use list_consultation_templates() to see available templates."

        # Build user-friendly display of questions
        output = f"📋 Consultation Template: {data.name}\n"
        if data.description:
            output += f"Description: {data.description}\n"
        output += f"\n{'=' * 70}\n"
        output += f"Here are the questions that need to be answered:\n"
        output += f"{'=' * 70}\n\n"

        fields = data.fields or []
        if not fields:
            return f"⚠️ Template '{data.name}' has no fields defined yet."

        for idx, field in enumerate(fields, 1):
            required_label = "🔴 REQUIRED" if field.required else "⚪ optional"
            output += f"{idx}. {field.label} [{required_label}]\n"
            if field.type == "select" and field.options:
                output += f"   📋 Choose from: {', '.join(field.options)}\n"
            elif field.type == "textarea":
                output += f"   📝 Type: Multiple lines of text\n"
            elif field.type == "date":
                output += f"   📅 Type: Date (YYYY-MM-DD format)\n"
            else:
                output += f"   📝 Type: {field.type}\n"
            if field.placeholder:
                output += f"   💡 Example: {field.placeholder}\n"
            output += "\n"

        output += f"{'=' * 70}\n"
        output += f"\n✅ Please provide answers to all 🔴 REQUIRED questions above.\n"
        output += f"\nYou can format your answers as:\n"
        output += f"  1️⃣  Using question text: 'Question text: Answer'\n"
        output += f"  2️⃣  Simply in order: 'Answer 1, Answer 2, Answer 3'\n"
        output += f"  3️⃣  As a list: ['Answer 1', 'Answer 2', 'Answer 3']\n"

        return output
    except Exception as e:
        return f"❌ Error fetching template: {str(e)}. Template ID may be invalid or you may not have permission to access it."


@tool
def get_consultation_template(
    template_id: Annotated[str, "UUID of the consultation template"],
) -> str:
    """Get and display consultation template questions for user to answer.
    Shows all questions in the template that need to be answered.
    Shows each field's label, type (text/textarea/select), whether it's required, placeholder text, and options."""

    try:
        data = consultation_svc.get_template(template_id)
        if not data:
            return f"Template {template_id} not found."

        # Build user-friendly display of questions
        output = f"📋 Consultation Template: {data.name}\n\n"
        output += f"Please provide answers to the following questions:\n"
        output += "=" * 60 + "\n\n"

        fields = data.fields or []
        for idx, field in enumerate(fields, 1):
            required_label = "(REQUIRED)" if field.required else "(optional)"
            output += f"{idx}. {field.label} {required_label}\n"
            output += f"   Type: {field.type}\n"
            if field.type == "select" and field.options:
                output += f"   Options: {', '.join(field.options)}\n"
            if field.placeholder:
                output += f"   Example: {field.placeholder}\n"
            output += "\n"

        output += "=" * 60 + "\n"
        output += f"Total questions: {len(fields)}\n"
        output += "Please answer each question above."

        return output
    except Exception as e:
        return f"Error fetching template: {str(e)}"


@tool
def create_consultation_template(
    name: Annotated[str, "Template name (e.g., 'Skincare Assessment Form')"],
    fields: Annotated[list[dict], "REQUIRED: List of template QUESTION FIELDS. Each field: {label (the question), type (text/textarea/select), required (bool), placeholder (optional), options (optional for select type)}"],
    description: Annotated[Optional[str], "Optional: Description of what this form template is for"] = None,
) -> str:
    """Create a reusable CONSULTATION QUESTION FORM template — NOT for treatment plans.

    This creates a form with custom questions for gathering client information during consultations (e.g., "Skin Type", "Allergies", "Concerns"). NOT a treatment recovery schedule with duration.

    Do NOT use this for treatment/recovery plans with duration — use create_treatment_plan_template instead.

    Field structure (send without id — we generate it): {"label": "Question text", "type": "text|textarea|select", "required": true/false, "placeholder": "...", "options": [...]}

    Steps:
    1. Ask admin for template name
    2. Ask for description (optional)
    3. Ask admin how many fields the template should have
    4. For each field, ask ONLY:
       - Field label (question text)
       - Type (text, textarea, or select)
       - Required (yes/no)
       - Placeholder text (optional, example answer)
       - If select: list the options
    5. Confirm the template structure before creating

    Do NOT ask for field IDs — they are auto-generated.
    """
    try:
        # Auto-generate UUIDs for each field
        fields_with_ids = []
        for field in fields:
            field_with_id = {**field, "id": str(uuid.uuid4())}
            fields_with_ids.append(field_with_id)

        body = {
            "name": name,
            "description": description,
            "fields": fields_with_ids,
            "is_active": True,
        }
        body = {k: v for k, v in body.items() if v is not None}
        consultation_svc.create_template(body)
        return f"✓ Consultation form template '{name}' created successfully with {len(fields_with_ids)} question field(s)."
    except Exception as e:
        return f"Failed to create template: {e}"


customer_consultation_tools = [get_my_consultation_records, create_consultation_record, list_consultation_templates, get_consultation_template, prepare_consultation_template_for_responses]
staff_consultation_tools = [*customer_consultation_tools, get_consultation_records]
admin_consultation_tools = [*staff_consultation_tools, create_consultation_template]

