"""Database seeding script.

Run from the backend/ directory:
    python -m scripts.seed
"""

import sys
from app.core.supabase import get_admin_db_client
from app.utils.product_svgs import PRODUCT_SVGS
from app.utils.seed_data import (
    BUSINESS_SETTINGS,
    CONSULTATION_TEMPLATES,
    PRODUCTS,
    SERVICE_CATEGORIES,
    SERVICES,
    TREATMENT_PLAN_TEMPLATES,
)


def seed_users() -> list[dict]:
    """Create admin, staff, and customer users."""
    print("\n→ Creating users...")
    supabase = get_admin_db_client()

    users = [
        {"email": "admin@gmail.com", "name": "Admin", "role": "admin", "phone": "+1 (555) 001-0001"},
        {"email": "staff@gmail.com", "name": "Sarah Mitchell", "role": "staff", "phone": "+1 (555) 002-0002"},
        {"email": "ahmad@gmail.com", "name": "Ahmad", "role": "staff", "phone": "+1 (555) 002-0003"},
        {"email": "customer@gmail.com", "name": "Emma Johnson", "role": "customer", "phone": "+1 (555) 003-0003"},
        {"email": "basit@gmail.com", "name": "Basit", "role": "customer", "phone": "+1 (555) 003-0004"},
    ]

    created = []

    for u in users:
        existing_users = supabase.auth.admin.list_users()
        existing_user = next(
            (x for x in existing_users.users if x.email == u["email"]),
            None,
        )
        if existing_user:
            supabase.auth.admin.delete_user(existing_user.id)
            print(f"  Removed existing {u['email']}")

        user_resp = supabase.auth.admin.create_user(
            email=u["email"],
            password="1234qwer",
            email_confirm=True,
            user_metadata={"full_name": u["name"]},
        )
        if user_resp.user is None:
            raise ValueError(f"Failed to create user {u['email']}")
        user_id = user_resp.user.id
        print(f"  ✓ {u['role']}: {u['email']} ({user_id})")
        created.append(
            {
                "id": user_id,
                "email": u["email"],
                "name": u["name"],
                "role": u["role"],
                "phone": u["phone"],
            }
        )

    for u in created:
        supabase.from_("profiles").upsert({
            "id": u["id"],
            "role": u["role"],
            "full_name": u["name"],
            "phone": u["phone"],
            "is_active": True,
        }).execute()

    print("  ✓ Profiles upserted")
    return created


def seed_staff_profile(supabase, staff_id: str, name: str) -> None:
    """Create staff profile."""
    supabase.from_("staff_profiles").upsert({
        "profile_id": staff_id,
        "bio": "Certified esthetician with extensive experience in skin rejuvenation and advanced facial treatments. Passionate about helping clients achieve their best skin.",
        "specializations": ["Facials", "Chemical Peels", "Microdermabrasion", "Anti-Aging Treatments"],
        "certifications": ["Licensed Esthetician (LE)", "Advanced Peel Certification"],
        "hire_date": "2022-03-15",
        "hourly_rate": 45,
        "commission_rate": 15,
        "is_available": True,
    }).execute()
    print(f"  ✓ Staff profile created for {name}")


def seed_services(supabase) -> None:
    """Create service categories and services."""
    print("\n→ Creating service categories & services...")

    supabase.from_("services").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
    supabase.from_("service_categories").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()

    cat_data = supabase.from_("service_categories").insert(
        [{"name": c["name"], "description": c["description"], "sort_order": c["sort_order"], "is_active": True}
         for c in SERVICE_CATEGORIES]
    ).select().execute()

    print(f"  ✓ {len(cat_data.data)} categories")

    cat_id_map = {c["name"]: c["id"] for c in cat_data.data}

    services_to_insert = [
        {**s, "category_id": cat_id_map.get(s["category_name"]), "is_active": True}
        for s in SERVICES
    ]
    for s in services_to_insert:
        s.pop("category_name", None)

    svc_data = supabase.from_("services").insert(services_to_insert).select().execute()
    print(f"  ✓ {len(svc_data.data)} services")


def seed_consultation_templates(supabase) -> None:
    """Create consultation templates."""
    print("\n→ Creating consultation templates...")
    supabase.from_("consultation_form_templates").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()

    tpl_data = supabase.from_("consultation_form_templates").insert(
        [{"name": t["name"], "description": t["description"], "fields": t["fields"], "is_active": True}
         for t in CONSULTATION_TEMPLATES]
    ).select().execute()

    print(f"  ✓ {len(tpl_data.data)} consultation templates")


def seed_products(supabase) -> None:
    """Create product storage, categories, and products."""
    print("\n→ Setting up product storage & categories...")

    buckets = supabase.storage.list_buckets()
    bucket_name = "product-images"
    exists = any(b.name == bucket_name for b in buckets)
    if not exists:
        supabase.storage.create_bucket(bucket_name, {"public": True})
        print(f'  ✓ Created bucket "{bucket_name}"')
    else:
        print(f'  ✓ Bucket "{bucket_name}" already exists')

    print("\n→ Uploading product SVG images...")
    image_urls = {}

    for key, svg_content in PRODUCT_SVGS.items():
        path = f"products/{key}.svg"
        buffer = svg_content.encode("utf-8")
        supabase.storage.from_(bucket_name).upload(
            path,
            buffer,
            {"contentType": "image/svg+xml", "upsert": True},
        )
        url_data = supabase.storage.from_(bucket_name).get_public_url(path)
        image_urls[key] = url_data["publicUrl"]
        print(f"  ✓ {key}")

    print("\n→ Creating product categories...")
    pcat_data = supabase.from_("product_categories").insert(
        [{"name": c["name"], "description": c["description"], "sort_order": c["sort_order"], "is_active": True}
         for c in [
            {"name": "Skincare", "description": "Serums, moisturisers, cleansers and more", "sort_order": 1},
            {"name": "Haircare", "description": "Shampoos, conditioners, masks and scalp treatments", "sort_order": 2},
            {"name": "Body Care", "description": "Lotions, scrubs and body oils", "sort_order": 3},
            {"name": "Tools & Accessories", "description": "Rollers, gua sha and professional beauty tools", "sort_order": 4},
        ]]
    ).select().execute()

    pcat_id_map = {c["name"]: c["id"] for c in pcat_data.data}
    print(f"  ✓ {len(pcat_data.data)} product categories")

    supabase.from_("products").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()

    products_to_insert = [
        {**p, "category_id": pcat_id_map.get(p["category_name"]), "image_url": image_urls.get(p["image_key"]), "is_active": True}
        for p in PRODUCTS
    ]
    for p in products_to_insert:
        p.pop("category_name", None)
        p.pop("image_key", None)

    prod_data = supabase.from_("products").insert(products_to_insert).select().execute()
    print(f"  ✓ {len(prod_data.data)} products")


def seed_business_settings(supabase, admin_id: str) -> None:
    """Seed business settings."""
    print("\n→ Seeding business settings...")

    settings = BUSINESS_SETTINGS(admin_id)

    supabase.from_("business_settings").delete().in_(
        "key",
        [s["key"] for s in settings],
    ).execute()

    supabase.from_("business_settings").insert(settings).execute()
    print(f"  ✓ {len(settings)} settings entries")


def seed_treatment_plan_templates(supabase) -> None:
    """Seed treatment plan templates."""
    print("\n→ Seeding treatment plan templates...")

    supabase.from_("treatment_plan_templates").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()

    tpl_data = supabase.from_("treatment_plan_templates").insert(
        [{"name": t["name"], "description": t["description"], "duration_days": t["duration_days"], "steps": t["steps"], "is_active": True}
         for t in TREATMENT_PLAN_TEMPLATES]
    ).select().execute()

    print(f"  ✓ {len(tpl_data.data)} treatment plan templates")


def main() -> None:
    """Main seed function."""
    print("╔═══════════════════════════════╗")
    print("║  Glow By Miral — DB Seeder    ║")
    print("╚═══════════════════════════════╝")

    supabase = get_admin_client()
    print(f"  Supabase: {supabase.url}")

    users = seed_users()
    admin_user = next(u for u in users if u["role"] == "admin")
    staff_users = [u for u in users if u["role"] == "staff"]

    print("\n→ Creating staff profiles...")
    for s in staff_users:
        seed_staff_profile(supabase, s["id"], s["name"])

    seed_services(supabase)
    seed_consultation_templates(supabase)
    seed_treatment_plan_templates(supabase)
    seed_products(supabase)
    seed_business_settings(supabase, admin_user["id"])

    print("\n╔═══════════════════════════════╗")
    print("║  Seeding complete!            ║")
    print("╚═══════════════════════════════╝")
    print("\nLogin credentials (password: 1234qwer):")
    for u in users:
        print(f"  {u['email'].ljust(26)} ({u['role']} — {u['name']})")


if __name__ == "__main__":
    try:
        main()
    except Exception as err:
        print(f"\n✗ Seed failed: {err}")
        sys.exit(1)
