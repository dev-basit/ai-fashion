/* eslint-disable no-console */
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SECRET_KEY = process.env.SUPABASE_SECRET_KEY!;

if (!SUPABASE_URL || !SECRET_KEY) {
  console.error("Missing env vars. Run: npm run seed");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SECRET_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ─────────────────────────────────────────────
// SVG product images (200×200, monochrome)
// ─────────────────────────────────────────────
const PRODUCT_SVGS: Record<string, string> = {
  "vitamin-c-serum": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <rect width="200" height="200" fill="#fafafa"/>
  <rect x="80" y="30" width="40" height="10" rx="5" fill="#1a1a1a"/>
  <rect x="85" y="40" width="30" height="6" rx="2" fill="#1a1a1a"/>
  <rect x="70" y="46" width="60" height="100" rx="12" fill="#1a1a1a"/>
  <rect x="74" y="50" width="52" height="92" rx="9" fill="white"/>
  <circle cx="100" cy="96" r="18" fill="#1a1a1a"/>
  <path d="M100 82 L104 90 L113 90 L106 96 L109 105 L100 99 L91 105 L94 96 L87 90 L96 90 Z" fill="white"/>
  <text x="100" y="156" text-anchor="middle" font-size="9" font-family="sans-serif" fill="#1a1a1a">VITAMIN C</text>
  <text x="100" y="167" text-anchor="middle" font-size="8" font-family="sans-serif" fill="#555">BRIGHTENING SERUM</text>
  <rect x="74" y="132" width="52" height="2" fill="#e0e0e0"/>
  </svg>`,

  "hyaluronic-moisturizer": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <rect width="200" height="200" fill="#fafafa"/>
  <ellipse cx="100" cy="130" rx="52" ry="12" fill="#e0e0e0"/>
  <rect x="60" y="75" width="80" height="58" rx="14" fill="#1a1a1a"/>
  <rect x="64" y="79" width="72" height="50" rx="11" fill="white"/>
  <path d="M100 88 Q108 95 100 106 Q92 95 100 88Z" fill="#1a1a1a"/>
  <text x="100" y="122" text-anchor="middle" font-size="8" font-family="sans-serif" fill="#1a1a1a">HA CREAM</text>
  <ellipse cx="100" cy="75" rx="40" ry="8" fill="#1a1a1a"/>
  <ellipse cx="100" cy="72" rx="38" ry="6" fill="#333"/>
  <text x="100" y="158" text-anchor="middle" font-size="9" font-family="sans-serif" fill="#1a1a1a">HYALURONIC ACID</text>
  <text x="100" y="169" text-anchor="middle" font-size="8" font-family="sans-serif" fill="#555">MOISTURIZER</text>
  </svg>`,

  "foaming-cleanser": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <rect width="200" height="200" fill="#fafafa"/>
  <rect x="75" y="45" width="50" height="115" rx="10" fill="#1a1a1a"/>
  <rect x="79" y="49" width="42" height="107" rx="7" fill="white"/>
  <rect x="92" y="35" width="16" height="14" rx="4" fill="#333"/>
  <rect x="96" y="25" width="8" height="12" rx="4" fill="#1a1a1a"/>
  <circle cx="100" cy="80" r="2" fill="#1a1a1a"/>
  <circle cx="106" cy="72" r="1.5" fill="#1a1a1a"/>
  <circle cx="94" cy="68" r="1.8" fill="#1a1a1a"/>
  <circle cx="100" cy="65" r="1.5" fill="#1a1a1a"/>
  <text x="100" y="104" text-anchor="middle" font-size="9" font-family="sans-serif" fill="#1a1a1a">GENTLE</text>
  <text x="100" y="115" text-anchor="middle" font-size="9" font-family="sans-serif" fill="#1a1a1a">FOAMING</text>
  <text x="100" y="126" text-anchor="middle" font-size="8" font-family="sans-serif" fill="#555">CLEANSER</text>
  <text x="100" y="165" text-anchor="middle" font-size="9" font-family="sans-serif" fill="#1a1a1a">GENTLE FOAMING</text>
  <text x="100" y="176" text-anchor="middle" font-size="8" font-family="sans-serif" fill="#555">CLEANSER</text>
  </svg>`,

  "rosehip-facial-oil": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <rect width="200" height="200" fill="#fafafa"/>
  <rect x="88" y="28" width="24" height="8" rx="4" fill="#1a1a1a"/>
  <circle cx="100" cy="24" r="6" fill="#333"/>
  <rect x="86" y="36" width="28" height="8" rx="3" fill="#555"/>
  <rect x="82" y="44" width="36" height="95" rx="10" fill="#1a1a1a"/>
  <rect x="86" y="48" width="28" height="87" rx="7" fill="#f5f0e8"/>
  <path d="M100 68 Q107 62 114 68 Q114 76 100 82 Q86 76 86 68 Q93 62 100 68Z" fill="#1a1a1a" opacity="0.6"/>
  <path d="M100 74 Q104 71 107 74 Q107 78 100 80 Q93 78 93 74 Q96 71 100 74Z" fill="white" opacity="0.5"/>
  <text x="100" y="106" text-anchor="middle" font-size="9" font-family="sans-serif" fill="#1a1a1a">ROSE HIP</text>
  <text x="100" y="117" text-anchor="middle" font-size="8" font-family="sans-serif" fill="#555">FACIAL OIL</text>
  <text x="100" y="158" text-anchor="middle" font-size="9" font-family="sans-serif" fill="#1a1a1a">ROSE HIP FACIAL OIL</text>
  <text x="100" y="169" text-anchor="middle" font-size="8" font-family="sans-serif" fill="#555">PURE · COLD-PRESSED</text>
  </svg>`,

  "daily-sunscreen": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <rect width="200" height="200" fill="#fafafa"/>
  <rect x="65" y="55" width="70" height="100" rx="12" fill="#1a1a1a"/>
  <rect x="69" y="59" width="62" height="92" rx="9" fill="white"/>
  <path d="M100 72 L103 80 L112 80 L105 85 L108 94 L100 89 L92 94 L95 85 L88 80 L97 80 Z" fill="#1a1a1a"/>
  <text x="100" y="110" text-anchor="middle" font-size="14" font-family="sans-serif" font-weight="bold" fill="#1a1a1a">SPF</text>
  <text x="100" y="126" text-anchor="middle" font-size="20" font-family="sans-serif" font-weight="bold" fill="#1a1a1a">50</text>
  <rect x="80" y="55" width="40" height="10" rx="5" fill="#555"/>
  <text x="100" y="165" text-anchor="middle" font-size="9" font-family="sans-serif" fill="#1a1a1a">SPF 50 DAILY</text>
  <text x="100" y="176" text-anchor="middle" font-size="8" font-family="sans-serif" fill="#555">SUNSCREEN</text>
  </svg>`,

  "retinol-night-cream": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <rect width="200" height="200" fill="#fafafa"/>
  <ellipse cx="100" cy="128" rx="48" ry="10" fill="#ddd"/>
  <rect x="58" y="78" width="84" height="54" rx="14" fill="#1a1a1a"/>
  <rect x="62" y="82" width="76" height="46" rx="11" fill="#1c1c2e"/>
  <path d="M100 92 Q112 95 107 106 Q100 113 93 106 Q88 95 100 92Z" fill="#c0c0d0"/>
  <circle cx="109" cy="93" r="3" fill="#e8e8f0" opacity="0.6"/>
  <text x="100" y="119" text-anchor="middle" font-size="8" font-family="sans-serif" fill="white">RETINOL</text>
  <ellipse cx="100" cy="78" rx="42" ry="8" fill="#1a1a1a"/>
  <ellipse cx="100" cy="75" rx="40" ry="6" fill="#2a2a3a"/>
  <text x="100" y="155" text-anchor="middle" font-size="9" font-family="sans-serif" fill="#1a1a1a">RETINOL NIGHT</text>
  <text x="100" y="166" text-anchor="middle" font-size="8" font-family="sans-serif" fill="#555">RENEWAL CREAM</text>
  </svg>`,

  "sugar-scrub": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <rect width="200" height="200" fill="#fafafa"/>
  <ellipse cx="100" cy="135" rx="52" ry="10" fill="#e0e0e0"/>
  <rect x="58" y="80" width="84" height="58" rx="14" fill="#1a1a1a"/>
  <rect x="62" y="84" width="76" height="50" rx="11" fill="white"/>
  <circle cx="85" cy="104" r="3" fill="#ddd"/>
  <circle cx="100" cy="98" r="3.5" fill="#ccc"/>
  <circle cx="115" cy="106" r="3" fill="#ddd"/>
  <circle cx="92" cy="112" r="2.5" fill="#ccc"/>
  <circle cx="108" cy="114" r="2.5" fill="#ddd"/>
  <text x="100" y="122" text-anchor="middle" font-size="8" font-family="sans-serif" fill="#555">SUGAR SCRUB</text>
  <ellipse cx="100" cy="80" rx="42" ry="8" fill="#1a1a1a"/>
  <ellipse cx="100" cy="77" rx="40" ry="6" fill="#333"/>
  <text x="100" y="155" text-anchor="middle" font-size="9" font-family="sans-serif" fill="#1a1a1a">EXFOLIATING</text>
  <text x="100" y="166" text-anchor="middle" font-size="8" font-family="sans-serif" fill="#555">SUGAR SCRUB</text>
  </svg>`,

  "eye-revive-cream": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <rect width="200" height="200" fill="#fafafa"/>
  <ellipse cx="100" cy="115" rx="52" ry="18" fill="#1a1a1a"/>
  <ellipse cx="100" cy="112" rx="50" ry="16" fill="white" stroke="#1a1a1a" stroke-width="2"/>
  <ellipse cx="100" cy="112" rx="46" ry="13" fill="#f8f8f8"/>
  <path d="M76 112 Q88 102 100 112 Q112 102 124 112 Q112 122 100 112 Q88 122 76 112Z" fill="#1a1a1a" opacity="0.08"/>
  <circle cx="100" cy="112" r="6" fill="#1a1a1a" opacity="0.15"/>
  <ellipse cx="100" cy="95" rx="50" ry="10" fill="#1a1a1a"/>
  <ellipse cx="100" cy="92" rx="48" ry="8" fill="#333"/>
  <text x="100" y="95" text-anchor="middle" font-size="8" font-family="sans-serif" fill="white">EYE REVIVE</text>
  <text x="100" y="148" text-anchor="middle" font-size="9" font-family="sans-serif" fill="#1a1a1a">EYE REVIVE CREAM</text>
  <text x="100" y="159" text-anchor="middle" font-size="8" font-family="sans-serif" fill="#555">DE-PUFFING · BRIGHTENING</text>
  </svg>`,

  "keratin-shampoo": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <rect width="200" height="200" fill="#fafafa"/>
  <rect x="75" y="38" width="50" height="115" rx="12" fill="#1a1a1a"/>
  <rect x="79" y="42" width="42" height="107" rx="9" fill="white"/>
  <rect x="88" y="28" width="24" height="14" rx="6" fill="#333"/>
  <rect x="93" y="20" width="14" height="10" rx="5" fill="#555"/>
  <path d="M93 20 L107 20 L107 22 L93 22 Z" fill="#1a1a1a"/>
  <text x="100" y="82" text-anchor="middle" font-size="10" font-family="sans-serif" font-weight="bold" fill="#1a1a1a">K</text>
  <path d="M86 88 Q100 82 114 88" stroke="#1a1a1a" stroke-width="1.5" fill="none"/>
  <text x="100" y="102" text-anchor="middle" font-size="8" font-family="sans-serif" fill="#1a1a1a">KERATIN</text>
  <text x="100" y="112" text-anchor="middle" font-size="8" font-family="sans-serif" fill="#555">REPAIR</text>
  <text x="100" y="160" text-anchor="middle" font-size="9" font-family="sans-serif" fill="#1a1a1a">KERATIN REPAIR</text>
  <text x="100" y="171" text-anchor="middle" font-size="8" font-family="sans-serif" fill="#555">SHAMPOO</text>
  </svg>`,

  "hair-mask": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <rect width="200" height="200" fill="#fafafa"/>
  <ellipse cx="100" cy="130" rx="55" ry="12" fill="#e0e0e0"/>
  <rect x="55" y="72" width="90" height="62" rx="16" fill="#1a1a1a"/>
  <rect x="59" y="76" width="82" height="54" rx="13" fill="white"/>
  <path d="M80 100 Q88 90 100 94 Q112 90 120 100" stroke="#1a1a1a" stroke-width="2" fill="none"/>
  <path d="M84 106 Q92 96 100 100 Q108 96 116 106" stroke="#555" stroke-width="1.5" fill="none"/>
  <text x="100" y="120" text-anchor="middle" font-size="8" font-family="sans-serif" fill="#555">HAIR MASK</text>
  <ellipse cx="100" cy="72" rx="45" ry="9" fill="#1a1a1a"/>
  <ellipse cx="100" cy="69" rx="43" ry="7" fill="#333"/>
  <text x="100" y="152" text-anchor="middle" font-size="9" font-family="sans-serif" fill="#1a1a1a">DEEP MOISTURE</text>
  <text x="100" y="163" text-anchor="middle" font-size="8" font-family="sans-serif" fill="#555">HAIR MASK</text>
  </svg>`,

  "scalp-tonic": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <rect width="200" height="200" fill="#fafafa"/>
  <rect x="82" y="42" width="36" height="110" rx="10" fill="#1a1a1a"/>
  <rect x="86" y="46" width="28" height="102" rx="7" fill="white"/>
  <rect x="92" y="32" width="16" height="14" rx="6" fill="#333"/>
  <path d="M108 35 L118 30 L120 35 L112 36Z" fill="#1a1a1a"/>
  <circle cx="120" cy="28" r="3" fill="#555"/>
  <text x="100" y="90" text-anchor="middle" font-size="8" font-family="sans-serif" fill="#1a1a1a">SCALP</text>
  <text x="100" y="101" text-anchor="middle" font-size="8" font-family="sans-serif" fill="#555">BALANCE</text>
  <text x="100" y="112" text-anchor="middle" font-size="7" font-family="sans-serif" fill="#888">TONIC</text>
  <circle cx="100" cy="122" r="3" fill="#1a1a1a" opacity="0.2"/>
  <text x="100" y="165" text-anchor="middle" font-size="9" font-family="sans-serif" fill="#1a1a1a">SCALP BALANCE</text>
  <text x="100" y="176" text-anchor="middle" font-size="8" font-family="sans-serif" fill="#555">TONIC</text>
  </svg>`,

  "body-lotion": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <rect width="200" height="200" fill="#fafafa"/>
  <rect x="76" y="42" width="48" height="118" rx="12" fill="#1a1a1a"/>
  <rect x="80" y="46" width="40" height="110" rx="9" fill="white"/>
  <rect x="88" y="32" width="24" height="14" rx="6" fill="#333"/>
  <rect x="94" y="24" width="12" height="10" rx="5" fill="#555"/>
  <circle cx="100" cy="22" r="4" fill="#1a1a1a"/>
  <path d="M84 90 Q100 80 116 90" stroke="#1a1a1a" stroke-width="1.5" fill="none"/>
  <text x="100" y="108" text-anchor="middle" font-size="9" font-family="sans-serif" fill="#1a1a1a">LAVENDER</text>
  <text x="100" y="119" text-anchor="middle" font-size="8" font-family="sans-serif" fill="#555">BODY LOTION</text>
  <path d="M88 70 Q94 65 100 72 Q106 65 112 70" stroke="#1a1a1a" stroke-width="1" fill="none" opacity="0.4"/>
  <text x="100" y="170" text-anchor="middle" font-size="9" font-family="sans-serif" fill="#1a1a1a">LAVENDER BODY</text>
  <text x="100" y="181" text-anchor="middle" font-size="8" font-family="sans-serif" fill="#555">LOTION</text>
  </svg>`,

  "body-scrub": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <rect width="200" height="200" fill="#fafafa"/>
  <ellipse cx="100" cy="130" rx="58" ry="12" fill="#e0e0e0"/>
  <rect x="52" y="76" width="96" height="57" rx="16" fill="#1a1a1a"/>
  <rect x="56" y="80" width="88" height="49" rx="13" fill="white"/>
  <path d="M80 96 L84 90 L88 96 L84 92 Z" fill="#1a1a1a" opacity="0.3"/>
  <path d="M96 92 L100 86 L104 92 L100 88 Z" fill="#1a1a1a" opacity="0.3"/>
  <path d="M112 96 L116 90 L120 96 L116 92 Z" fill="#1a1a1a" opacity="0.3"/>
  <path d="M88 108 L92 102 L96 108 L92 104 Z" fill="#555" opacity="0.3"/>
  <path d="M104 110 L108 104 L112 110 L108 106 Z" fill="#555" opacity="0.3"/>
  <text x="100" y="118" text-anchor="middle" font-size="8" font-family="sans-serif" fill="#555">DETOX SCRUB</text>
  <ellipse cx="100" cy="76" rx="48" ry="9" fill="#1a1a1a"/>
  <ellipse cx="100" cy="73" rx="46" ry="7" fill="#333"/>
  <text x="100" y="152" text-anchor="middle" font-size="9" font-family="sans-serif" fill="#1a1a1a">DETOXIFYING</text>
  <text x="100" y="163" text-anchor="middle" font-size="8" font-family="sans-serif" fill="#555">BODY SCRUB</text>
  </svg>`,

  "jade-roller": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <rect width="200" height="200" fill="#fafafa"/>
  <rect x="96" y="130" width="8" height="30" rx="4" fill="#555"/>
  <rect x="90" y="155" width="20" height="10" rx="5" fill="#333"/>
  <rect x="55" y="60" width="90" height="75" rx="20" fill="#1a1a1a"/>
  <ellipse cx="100" cy="60" rx="45" ry="16" fill="#2a2a2a"/>
  <ellipse cx="100" cy="135" rx="45" ry="16" fill="#2a2a2a"/>
  <rect x="59" y="64" width="82" height="67" rx="17" fill="white" opacity="0.15"/>
  <ellipse cx="78" cy="97" rx="16" ry="18" fill="white" opacity="0.08"/>
  <ellipse cx="122" cy="97" rx="10" ry="12" fill="white" opacity="0.08"/>
  <text x="100" y="101" text-anchor="middle" font-size="9" font-family="sans-serif" fill="white">JADE</text>
  <text x="100" y="113" text-anchor="middle" font-size="8" font-family="sans-serif" fill="white" opacity="0.7">ROLLER</text>
  <text x="100" y="172" text-anchor="middle" font-size="9" font-family="sans-serif" fill="#1a1a1a">JADE FACIAL</text>
  <text x="100" y="183" text-anchor="middle" font-size="8" font-family="sans-serif" fill="#555">ROLLER</text>
  </svg>`,

  "gua-sha": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <rect width="200" height="200" fill="#fafafa"/>
  <path d="M65 70 Q65 50 100 45 Q135 50 135 70 L130 140 Q128 158 100 160 Q72 158 70 140 Z" fill="#1a1a1a"/>
  <path d="M70 72 Q70 54 100 50 Q130 54 130 72 L125 138 Q123 154 100 156 Q77 154 75 138 Z" fill="white" opacity="0.12"/>
  <path d="M78 75 Q78 62 100 58 Q122 62 122 75 L118 136 Q116 148 100 150 Q84 148 82 136 Z" fill="white" opacity="0.06"/>
  <path d="M85 115 Q100 108 115 115" stroke="white" stroke-width="1.5" fill="none" opacity="0.3"/>
  <path d="M87 125 Q100 119 113 125" stroke="white" stroke-width="1" fill="none" opacity="0.2"/>
  <text x="100" y="165" text-anchor="middle" font-size="9" font-family="sans-serif" fill="#1a1a1a">GUA SHA</text>
  <text x="100" y="176" text-anchor="middle" font-size="8" font-family="sans-serif" fill="#555">STONE SET</text>
  </svg>`,
};

// ─────────────────────────────────────────────
// Seed data
// ─────────────────────────────────────────────
async function seedUsers() {
  console.log("\n→ Creating users...");

  const users = [
    { email: "admin@gmail.com", name: "Admin", role: "admin", phone: "+1 (555) 001-0001" },
    { email: "staff@gmail.com", name: "Sarah Mitchell", role: "staff", phone: "+1 (555) 002-0002" },
    { email: "ahmad@gmail.com", name: "Ahmad", role: "staff", phone: "+1 (555) 002-0003" },
    { email: "customer@gmail.com", name: "Emma Johnson", role: "customer", phone: "+1 (555) 003-0003" },
    { email: "basit@gmail.com", name: "Basit", role: "customer", phone: "+1 (555) 003-0004" },
  ] as const;

  const created: { id: string; role: string; email: string; name: string; phone: string }[] = [];

  for (const u of users) {
    // Delete existing user with same email if present
    const { data: existing } = await supabase.auth.admin.listUsers();
    const existingUser = existing?.users?.find((x) => x.email === u.email);
    if (existingUser) {
      await supabase.auth.admin.deleteUser(existingUser.id);
      console.log(`  Removed existing ${u.email}`);
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: "1234qwer",
      email_confirm: true,
      user_metadata: { full_name: u.name },
    });

    if (error) throw new Error(`Create user ${u.email}: ${error.message}`);
    console.log(`  ✓ ${u.role}: ${u.email} (${data.user.id})`);
    created.push({ id: data.user.id, ...u });
  }

  // Upsert profiles
  for (const u of created) {
    const { error } = await supabase.from("profiles").upsert({
      id: u.id,
      role: u.role,
      full_name: u.name,
      phone: u.phone,
      is_active: true,
    });
    if (error) throw new Error(`Profile ${u.email}: ${error.message}`);
  }

  console.log("  ✓ Profiles upserted");
  return created;
}

async function seedStaffProfile(staffId: string, name: string) {
  const { error } = await supabase.from("staff_profiles").upsert({
    profile_id: staffId,
    bio: `Certified esthetician with extensive experience in skin rejuvenation and advanced facial treatments. Passionate about helping clients achieve their best skin.`,
    specializations: ["Facials", "Chemical Peels", "Microdermabrasion", "Anti-Aging Treatments"],
    certifications: ["Licensed Esthetician (LE)", "Advanced Peel Certification"],
    hire_date: "2022-03-15",
    hourly_rate: 45,
    commission_rate: 15,
    is_available: true,
  });

  if (error) throw new Error(`Staff profile (${name}): ${error.message}`);
  console.log(`  ✓ Staff profile created for ${name}`);
}

async function seedServices() {
  console.log("\n→ Creating service categories & services...");

  // Clean slate — delete in FK order
  await supabase.from("services").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("service_categories").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  const categories = [
    {
      name: "Facials & Skin Treatments",
      description: "Rejuvenating facial treatments tailored to your skin type",
      sort_order: 1,
    },
    {
      name: "Hair & Scalp Treatments",
      description: "Nourishing treatments to restore shine and scalp health",
      sort_order: 2,
    },
    {
      name: "Body Treatments",
      description: "Full-body relaxation and skin renewal therapies",
      sort_order: 3,
    },
    {
      name: "Nail Services",
      description: "Professional nail care, polish, and pedicure treatments",
      sort_order: 4,
    },
    {
      name: "Waxing & Threading",
      description: "Precise hair removal for smooth, long-lasting results",
      sort_order: 5,
    },
  ];

  const { data: catData, error: catErr } = await supabase
    .from("service_categories")
    .insert(categories.map((c) => ({ ...c, is_active: true })))
    .select();

  if (catErr) throw new Error(`Categories: ${catErr.message}`);
  console.log(`  ✓ ${catData.length} categories`);

  const catId = (name: string) => catData.find((c) => c.name === name)?.id;

  const services = [
    {
      name: "Signature Glow Facial",
      category_id: catId("Facials & Skin Treatments"),
      description:
        "Our signature 60-minute facial combines deep cleansing, exfoliation, steam, and a customised mask to leave your skin luminous and refreshed.",
      base_price: 85,
      duration_mins: 60,
      instructions: "Arrive with clean skin, no makeup. Avoid retinol 48h before treatment.",
      sort_order: 1,
    },
    {
      name: "Deep Pore Cleansing",
      category_id: catId("Facials & Skin Treatments"),
      description: "Targeted treatment to unclog pores, remove blackheads, and rebalance oily or congested skin.",
      base_price: 65,
      duration_mins: 45,
      instructions: "Ideal every 4–6 weeks. Avoid active breakout areas 24h before.",
      sort_order: 2,
    },
    {
      name: "Anti-Aging Lift Facial",
      category_id: catId("Facials & Skin Treatments"),
      description:
        "Intensive collagen-boosting facial with peptide serums, LED therapy, and firming massage techniques to visibly lift and plump.",
      base_price: 120,
      duration_mins: 75,
      instructions: "Patch test required for sensitive skin. SPF mandatory post-treatment.",
      sort_order: 3,
    },
    {
      name: "Microdermabrasion",
      category_id: catId("Facials & Skin Treatments"),
      description:
        "Crystal-free diamond tip resurfacing that buffs away dead skin cells, reducing fine lines, acne scars, and uneven texture.",
      base_price: 95,
      duration_mins: 60,
      instructions: "Do not use retinol 1 week before. Stay out of direct sun for 48h after.",
      sort_order: 4,
    },
    {
      name: "Chemical Peel (Lactic)",
      category_id: catId("Facials & Skin Treatments"),
      description:
        "Gentle lactic acid peel to brighten, hydrate, and smooth the skin surface — perfect for first-time peel clients.",
      base_price: 110,
      duration_mins: 45,
      instructions: "Avoid active sunburn. No gym or sweating for 24h post-peel.",
      sort_order: 5,
    },
    {
      name: "Scalp Revival Treatment",
      category_id: catId("Hair & Scalp Treatments"),
      description:
        "Therapeutic scalp massage with detox exfoliation and a targeted serum infusion to address dryness, flaking, and hair thinning.",
      base_price: 55,
      duration_mins: 45,
      instructions: "Come with unwashed hair for best absorption of treatment oils.",
      sort_order: 1,
    },
    {
      name: "Keratin Bond Treatment",
      category_id: catId("Hair & Scalp Treatments"),
      description:
        "Intensive protein reconstruction treatment that seals the hair cuticle, eliminates frizz, and restores elasticity for up to 8 weeks.",
      base_price: 145,
      duration_mins: 90,
      instructions: "Do not wash hair for 72h after. Avoid salt water and chlorine for 2 weeks.",
      sort_order: 2,
    },
    {
      name: "Deep Conditioning Mask",
      category_id: catId("Hair & Scalp Treatments"),
      description:
        "Warm oil infusion followed by a 30-minute deep conditioning mask customised to your hair type — dry, damaged, or colour-treated.",
      base_price: 45,
      duration_mins: 30,
      instructions: "Can be combined with any other hair service.",
      sort_order: 3,
    },
    {
      name: "Hot Stone Back Massage",
      category_id: catId("Body Treatments"),
      description:
        "Heated basalt stones glide over the back, shoulders, and neck to melt tension, improve circulation, and deeply relax tired muscles.",
      base_price: 95,
      duration_mins: 60,
      instructions: "Drink plenty of water before and after. Avoid alcohol 4h prior.",
      sort_order: 1,
    },
    {
      name: "Full Body Exfoliation",
      category_id: catId("Body Treatments"),
      description:
        "Head-to-toe sugar scrub followed by a hydrating lotion application — leaves skin silky smooth and ready to absorb moisture.",
      base_price: 85,
      duration_mins: 60,
      instructions: "Shower before your appointment. Best results when skin is dry.",
      sort_order: 2,
    },
    {
      name: "Aromatherapy Detox Wrap",
      category_id: catId("Body Treatments"),
      description:
        "Detoxifying clay body mask wrapped to draw out impurities, followed by a warm rinse and application of nourishing botanical oils.",
      base_price: 110,
      duration_mins: 75,
      instructions: "Avoid eating a heavy meal 2h prior. Wear or bring loose, comfortable clothing.",
      sort_order: 3,
    },
    {
      name: "Classic Gel Manicure",
      category_id: catId("Nail Services"),
      description:
        "Shape, buff, and cuticle care followed by a long-lasting gel polish application. Chip-free for up to 3 weeks.",
      base_price: 38,
      duration_mins: 45,
      instructions: "Remove previous gel polish before your appointment if possible.",
      sort_order: 1,
    },
    {
      name: "Luxury Spa Pedicure",
      category_id: catId("Nail Services"),
      description:
        "Foot soak, callus removal, extended massage, and a gel polish finish — a full hour of pure pedicure indulgence.",
      base_price: 68,
      duration_mins: 60,
      instructions: "Shave legs at least 24h before to avoid irritation. Bring open-toe shoes.",
      sort_order: 2,
    },
    {
      name: "Eyebrow Threading & Tint",
      category_id: catId("Waxing & Threading"),
      description:
        "Precise cotton thread technique to shape and define brows, followed by a custom tint to add depth and colour.",
      base_price: 28,
      duration_mins: 20,
      instructions: "Patch test required 24h before tint. Avoid threading during active skin irritation.",
      sort_order: 1,
    },
    {
      name: "Full Leg Wax",
      category_id: catId("Waxing & Threading"),
      description:
        "Smooth, long-lasting hair removal from the knee to hip using low-temperature strip wax suited for all skin tones.",
      base_price: 65,
      duration_mins: 45,
      instructions: "Hair must be at least 0.5 cm. Exfoliate 24h before. Avoid moisturiser on the day.",
      sort_order: 2,
    },
  ];

  const { data: svcData, error: svcErr } = await supabase
    .from("services")
    .insert(services.map((s) => ({ ...s, is_active: true })))
    .select();

  if (svcErr) throw new Error(`Services: ${svcErr.message}`);
  console.log(`  ✓ ${svcData.length} services`);
  return svcData;
}

async function seedConsultationTemplates() {
  console.log("\n→ Creating consultation templates...");

  const templates = [
    {
      name: "New Client Intake Form",
      description: "Comprehensive first-visit form covering health history, skin goals, and preferences.",
      fields: [
        { id: "f1", label: "Date of birth", type: "date", required: true },
        {
          id: "f2",
          label: "Primary skin concern",
          type: "select",
          required: true,
          options: [
            "Acne & breakouts",
            "Ageing & fine lines",
            "Dryness & dehydration",
            "Hyperpigmentation",
            "Redness & sensitivity",
            "Uneven texture",
            "Other",
          ],
        },
        {
          id: "f3",
          label: "Current skincare routine",
          type: "textarea",
          required: false,
          placeholder: "Describe your morning and evening routine",
        },
        {
          id: "f4",
          label: "Do you have any known allergies?",
          type: "radio",
          required: true,
          options: ["Yes", "No"],
        },
        { id: "f5", label: "If yes, please list your allergies", type: "textarea", required: false },
        {
          id: "f6",
          label: "Are you currently pregnant or breastfeeding?",
          type: "radio",
          required: true,
          options: ["Yes", "No", "Prefer not to say"],
        },
        {
          id: "f7",
          label: "How did you hear about us?",
          type: "select",
          required: false,
          options: ["Instagram", "Google", "Friend referral", "Walk-in", "Other"],
        },
      ],
    },
    {
      name: "Facial Treatment Assessment",
      description: "Pre-facial questionnaire to customise the treatment for optimal results.",
      fields: [
        {
          id: "f1",
          label: "Skin type",
          type: "select",
          required: true,
          options: ["Dry", "Oily", "Combination", "Normal", "Sensitive"],
        },
        {
          id: "f2",
          label: "Current skin concerns",
          type: "checkbox",
          required: true,
          options: ["Acne", "Fine lines", "Dark spots", "Redness", "Large pores", "Dullness"],
        },
        {
          id: "f3",
          label: "Have you had a facial before?",
          type: "radio",
          required: true,
          options: ["Yes", "No"],
        },
        {
          id: "f4",
          label: "Are you using any prescription topicals?",
          type: "radio",
          required: true,
          options: ["Yes — Retinol", "Yes — Acid-based", "Yes — Other", "No"],
        },
        {
          id: "f5",
          label: "Sensitivity or reactions to any ingredients?",
          type: "textarea",
          required: false,
          placeholder: "E.g. fragrance, AHAs, certain oils",
        },
        {
          id: "f6",
          label: "Desired outcome from today's session",
          type: "textarea",
          required: true,
          placeholder: "What would you like to achieve?",
        },
      ],
    },
    {
      name: "Acne & Breakout Consultation",
      description: "Detailed assessment for clients experiencing persistent breakouts.",
      fields: [
        {
          id: "f1",
          label: "How long have you experienced breakouts?",
          type: "select",
          required: true,
          options: ["Less than 6 months", "6–12 months", "1–3 years", "More than 3 years"],
        },
        {
          id: "f2",
          label: "Primary breakout location",
          type: "checkbox",
          required: true,
          options: ["Forehead", "Cheeks", "Jawline", "Chin", "Nose", "Back / Chest"],
        },
        {
          id: "f3",
          label: "Breakout type",
          type: "select",
          required: true,
          options: ["Whiteheads", "Blackheads", "Papules", "Cysts", "Mixed"],
        },
        {
          id: "f4",
          label: "Are you on any acne medication?",
          type: "radio",
          required: true,
          options: ["Yes — topical", "Yes — oral antibiotics", "Yes — Roaccutane / Accutane", "No"],
        },
        {
          id: "f5",
          label: "Does your acne worsen with stress or hormonal cycles?",
          type: "radio",
          required: false,
          options: ["Yes — stress", "Yes — hormonal", "Both", "Neither"],
        },
        { id: "f6", label: "Products currently using for acne", type: "textarea", required: false },
      ],
    },
    {
      name: "Anti-Aging Goals Assessment",
      description: "Understanding client expectations for anti-aging treatments.",
      fields: [
        {
          id: "f1",
          label: "Primary aging concerns",
          type: "checkbox",
          required: true,
          options: [
            "Fine lines",
            "Deep wrinkles",
            "Loss of firmness",
            "Volume loss",
            "Neck & décolletage",
            "Eye area",
          ],
        },
        {
          id: "f2",
          label: "Previous anti-aging treatments",
          type: "checkbox",
          required: false,
          options: ["Botox / fillers", "Chemical peels", "Microneedling", "LED therapy", "None"],
        },
        {
          id: "f3",
          label: "Sun exposure level",
          type: "select",
          required: true,
          options: [
            "Minimal (mostly indoors)",
            "Moderate (weekends outdoors)",
            "High (outdoor work or lifestyle)",
          ],
        },
        {
          id: "f4",
          label: "Do you currently use SPF daily?",
          type: "radio",
          required: true,
          options: ["Yes", "Sometimes", "No"],
        },
        {
          id: "f5",
          label: "Realistic treatment goal",
          type: "select",
          required: true,
          options: ["Subtle maintenance", "Visible improvement", "Significant transformation"],
        },
        { id: "f6", label: "Additional notes or concerns", type: "textarea", required: false },
      ],
    },
    {
      name: "Skin Hydration Assessment",
      description: "Evaluate dehydration levels and build a tailored moisture plan.",
      fields: [
        {
          id: "f1",
          label: "How does your skin feel mid-afternoon without products?",
          type: "select",
          required: true,
          options: ["Tight and flaky", "Comfortable", "Slightly oily", "Very oily"],
        },
        {
          id: "f2",
          label: "Water intake per day",
          type: "select",
          required: false,
          options: ["Less than 1L", "1–2L", "More than 2L"],
        },
        {
          id: "f3",
          label: "Do you use a moisturiser twice daily?",
          type: "radio",
          required: true,
          options: ["Yes", "Once daily", "Occasionally", "No"],
        },
        {
          id: "f4",
          label: "Environment you spend most time in",
          type: "select",
          required: false,
          options: ["Air-conditioned office", "Outdoor / humid", "Heated home", "Mixed"],
        },
        {
          id: "f5",
          label: "Current hydrating products used",
          type: "textarea",
          required: false,
          placeholder: "Serums, toners, oils...",
        },
      ],
    },
    {
      name: "Hair & Scalp Consultation",
      description: "Pre-treatment assessment for hair and scalp services.",
      fields: [
        {
          id: "f1",
          label: "Hair type",
          type: "select",
          required: true,
          options: ["Straight", "Wavy", "Curly", "Coily"],
        },
        {
          id: "f2",
          label: "Hair condition",
          type: "checkbox",
          required: true,
          options: ["Dry", "Damaged", "Colour-treated", "Chemically processed", "Fine", "Thick", "Normal"],
        },
        {
          id: "f3",
          label: "Scalp concern",
          type: "select",
          required: true,
          options: ["Dry / flaking", "Oily", "Sensitive / itchy", "Hair thinning", "No concern"],
        },
        {
          id: "f4",
          label: "Last chemical service date",
          type: "text",
          required: false,
          placeholder: "Month & year",
        },
        { id: "f5", label: "Goal for today's session", type: "textarea", required: true },
      ],
    },
    {
      name: "Body Treatment Consultation",
      description: "Health and preference screening before any body therapy.",
      fields: [
        {
          id: "f1",
          label: "Areas of concern",
          type: "checkbox",
          required: true,
          options: ["Upper back", "Lower back", "Shoulders", "Legs", "Arms", "Full body"],
        },
        {
          id: "f2",
          label: "Pressure preference for massage",
          type: "select",
          required: false,
          options: ["Light", "Medium", "Firm", "Deep tissue"],
        },
        {
          id: "f3",
          label: "Any injuries, surgeries, or chronic conditions?",
          type: "textarea",
          required: false,
          placeholder: "Please describe if applicable",
        },
        {
          id: "f4",
          label: "Sensitivity to scented products?",
          type: "radio",
          required: true,
          options: ["Yes", "No"],
        },
        { id: "f5", label: "Are you pregnant?", type: "radio", required: true, options: ["Yes", "No"] },
        {
          id: "f6",
          label: "Expected outcome",
          type: "select",
          required: true,
          options: ["Relaxation", "Pain relief", "Skin improvement", "Detox", "General wellness"],
        },
      ],
    },
    {
      name: "Pre-Wax Screening",
      description: "Safety checklist required before waxing or threading services.",
      fields: [
        {
          id: "f1",
          label: "Have you used Retinol or AHAs in the last 7 days?",
          type: "radio",
          required: true,
          options: ["Yes", "No"],
        },
        {
          id: "f2",
          label: "Are you on Roaccutane / Accutane?",
          type: "radio",
          required: true,
          options: ["Yes", "No"],
        },
        {
          id: "f3",
          label: "Any active skin conditions in the wax area?",
          type: "radio",
          required: true,
          options: ["Yes", "No"],
        },
        {
          id: "f4",
          label: "Last wax / shave date",
          type: "text",
          required: false,
          placeholder: "Approximately",
        },
        {
          id: "f5",
          label: "Preferred wax type",
          type: "select",
          required: false,
          options: ["Strip wax", "Hot wax", "No preference"],
        },
        { id: "f6", label: "Previous reactions to waxing?", type: "textarea", required: false },
      ],
    },
    {
      name: "Post-Treatment Follow-Up",
      description: "Collect client feedback and assess results after a completed treatment.",
      fields: [
        {
          id: "f1",
          label: "How satisfied were you with today's service?",
          type: "select",
          required: true,
          options: ["Very satisfied", "Satisfied", "Neutral", "Dissatisfied"],
        },
        {
          id: "f2",
          label: "Did you experience any adverse reactions?",
          type: "radio",
          required: true,
          options: ["Yes", "No"],
        },
        { id: "f3", label: "If yes, please describe", type: "textarea", required: false },
        {
          id: "f4",
          label: "Skin / body feeling immediately after treatment",
          type: "checkbox",
          required: true,
          options: ["Hydrated", "Tight", "Soothed", "Tingling", "Redness", "No change"],
        },
        {
          id: "f5",
          label: "Would you book this treatment again?",
          type: "radio",
          required: true,
          options: ["Definitely", "Probably", "Unsure", "No"],
        },
        { id: "f6", label: "Additional comments", type: "textarea", required: false },
      ],
    },
    {
      name: "Allergy & Sensitivity Screening",
      description: "Comprehensive allergy and contraindication checklist.",
      fields: [
        {
          id: "f1",
          label: "Known ingredient allergies",
          type: "checkbox",
          required: true,
          options: ["Fragrance", "Lanolin", "Latex", "Nuts / nut oils", "Salicylic acid", "None known"],
        },
        {
          id: "f2",
          label: "Skin conditions",
          type: "checkbox",
          required: false,
          options: ["Eczema", "Psoriasis", "Rosacea", "Dermatitis", "Urticaria", "None"],
        },
        {
          id: "f3",
          label: "Medical conditions relevant to treatment",
          type: "textarea",
          required: false,
          placeholder: "E.g. diabetes, immune disorders, blood thinners",
        },
        {
          id: "f4",
          label: "Do you have a pacemaker or metal implants?",
          type: "radio",
          required: true,
          options: ["Yes", "No"],
        },
        { id: "f5", label: "Medications currently taken", type: "textarea", required: false },
      ],
    },
    {
      name: "Nail & Cuticle Health Form",
      description: "Assessment before manicure or pedicure services.",
      fields: [
        {
          id: "f1",
          label: "Nail condition",
          type: "checkbox",
          required: true,
          options: ["Brittle", "Peeling", "Ridged", "Healthy", "Bitten"],
        },
        {
          id: "f2",
          label: "Any fungal infections or nail disorders?",
          type: "radio",
          required: true,
          options: ["Yes", "No"],
        },
        {
          id: "f3",
          label: "Current nail product / polish type",
          type: "select",
          required: false,
          options: ["Gel", "Acrylics", "Regular polish", "None"],
        },
        {
          id: "f4",
          label: "How often do you get a manicure?",
          type: "select",
          required: false,
          options: ["Weekly", "Every 2 weeks", "Monthly", "First time"],
        },
        {
          id: "f5",
          label: "Desired nail shape",
          type: "select",
          required: false,
          options: ["Square", "Round", "Oval", "Stiletto", "Almond"],
        },
        { id: "f6", label: "Additional notes", type: "textarea", required: false },
      ],
    },
    {
      name: "Client Lifestyle & Wellness Survey",
      description: "Understand the client's overall lifestyle to personalise treatment plans.",
      fields: [
        {
          id: "f1",
          label: "Sleep quality",
          type: "select",
          required: false,
          options: ["Excellent (7–9h)", "Fair (5–7h)", "Poor (under 5h)"],
        },
        {
          id: "f2",
          label: "Stress level",
          type: "select",
          required: false,
          options: ["Low", "Moderate", "High"],
        },
        {
          id: "f3",
          label: "Exercise frequency",
          type: "select",
          required: false,
          options: ["Daily", "3–5x/week", "1–2x/week", "Rarely"],
        },
        {
          id: "f4",
          label: "Diet description",
          type: "select",
          required: false,
          options: ["Balanced", "Vegan / vegetarian", "High sugar / processed", "Dairy-free", "Other"],
        },
        {
          id: "f5",
          label: "Smoking status",
          type: "radio",
          required: false,
          options: ["Non-smoker", "Occasional", "Regular smoker"],
        },
        { id: "f6", label: "Main wellness goal for this visit", type: "textarea", required: false },
      ],
    },
    {
      name: "Medical History & Contraindications",
      description: "Required form for clients before any advanced treatment.",
      fields: [
        {
          id: "f1",
          label: "Do you have any cardiovascular conditions?",
          type: "radio",
          required: true,
          options: ["Yes", "No"],
        },
        {
          id: "f2",
          label: "Have you had cancer treatment in the last 12 months?",
          type: "radio",
          required: true,
          options: ["Yes", "No"],
        },
        {
          id: "f3",
          label: "Any autoimmune conditions?",
          type: "radio",
          required: true,
          options: ["Yes", "No"],
        },
        {
          id: "f4",
          label: "Are you diabetic?",
          type: "radio",
          required: true,
          options: ["Type 1", "Type 2", "No"],
        },
        {
          id: "f5",
          label: "Are you on blood thinners?",
          type: "radio",
          required: true,
          options: ["Yes", "No"],
        },
        {
          id: "f6",
          label: "Please describe any other relevant medical history",
          type: "textarea",
          required: false,
        },
        {
          id: "f7",
          label: "I confirm the above information is accurate",
          type: "checkbox",
          required: true,
          options: ["I confirm"],
        },
      ],
    },
    {
      name: "Hyperpigmentation Consultation",
      description: "Targeted assessment for clients with uneven skin tone or dark spots.",
      fields: [
        {
          id: "f1",
          label: "Type of pigmentation concern",
          type: "select",
          required: true,
          options: [
            "Post-acne marks",
            "Sun damage / age spots",
            "Melasma / hormonal",
            "Uneven skin tone",
            "Mixed",
          ],
        },
        {
          id: "f2",
          label: "Fitzpatrick skin type",
          type: "select",
          required: true,
          options: [
            "Type I (very fair)",
            "Type II (fair)",
            "Type III (medium)",
            "Type IV (olive)",
            "Type V (brown)",
            "Type VI (dark)",
          ],
        },
        {
          id: "f3",
          label: "Previous treatments for pigmentation",
          type: "checkbox",
          required: false,
          options: ["Vitamin C products", "Chemical peels", "Laser", "Microdermabrasion", "None"],
        },
        {
          id: "f4",
          label: "Daily SPF use",
          type: "radio",
          required: true,
          options: ["Yes", "Sometimes", "No"],
        },
        {
          id: "f5",
          label: "Hormonal contraceptives or HRT?",
          type: "radio",
          required: false,
          options: ["Yes", "No"],
        },
        { id: "f6", label: "Describe the pigmented areas", type: "textarea", required: true },
      ],
    },
    {
      name: "Teen Skin & Wellbeing Assessment",
      description: "Age-appropriate consultation form for clients under 18 (guardian consent required).",
      fields: [
        { id: "f1", label: "Age", type: "select", required: true, options: ["Under 14", "14–15", "16–17"] },
        {
          id: "f2",
          label: "Guardian has provided written consent",
          type: "checkbox",
          required: true,
          options: ["Yes, consent provided"],
        },
        {
          id: "f3",
          label: "Main skin concern",
          type: "select",
          required: true,
          options: ["Acne", "Oiliness", "Dryness", "Sensitivity", "Other"],
        },
        {
          id: "f4",
          label: "Current skincare products used",
          type: "textarea",
          required: false,
          placeholder: "List products if known",
        },
        { id: "f5", label: "Any known allergies?", type: "radio", required: true, options: ["Yes", "No"] },
        { id: "f6", label: "Additional notes for therapist", type: "textarea", required: false },
      ],
    },
  ];

  // Clean slate
  await supabase.from("consultation_form_templates").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  const { data: tplData, error: tplErr } = await supabase
    .from("consultation_form_templates")
    .insert(templates.map((t) => ({ ...t, is_active: true })))
    .select();

  if (tplErr) throw new Error(`Templates: ${tplErr.message}`);
  console.log(`  ✓ ${tplData.length} consultation templates`);
}

async function seedProducts() {
  console.log("\n→ Setting up product storage & categories...");

  // Ensure storage bucket exists
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketName = "product-images";
  const exists = buckets?.some((b) => b.name === bucketName);
  if (!exists) {
    const { error } = await supabase.storage.createBucket(bucketName, { public: true });
    if (error) throw new Error(`Create bucket: ${error.message}`);
    console.log(`  ✓ Created bucket "${bucketName}"`);
  } else {
    console.log(`  ✓ Bucket "${bucketName}" already exists`);
  }

  // Upload SVG images
  console.log("\n→ Uploading product SVG images...");
  const imageUrls: Record<string, string> = {};

  for (const [key, svgContent] of Object.entries(PRODUCT_SVGS)) {
    const path = `products/${key}.svg`;
    const buffer = Buffer.from(svgContent, "utf-8");
    const { error } = await supabase.storage
      .from(bucketName)
      .upload(path, buffer, { contentType: "image/svg+xml", upsert: true });
    if (error) {
      console.warn(`  ! Upload ${key}: ${error.message}`);
    } else {
      const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(path);
      imageUrls[key] = urlData.publicUrl;
      console.log(`  ✓ ${key}`);
    }
  }

  // Product categories
  console.log("\n→ Creating product categories...");
  const pCats = [
    { name: "Skincare", description: "Serums, moisturisers, cleansers and more", sort_order: 1 },
    { name: "Haircare", description: "Shampoos, conditioners, masks and scalp treatments", sort_order: 2 },
    { name: "Body Care", description: "Lotions, scrubs and body oils", sort_order: 3 },
    {
      name: "Tools & Accessories",
      description: "Rollers, gua sha and professional beauty tools",
      sort_order: 4,
    },
  ];

  // Clean slate — products reference categories
  await supabase.from("products").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("product_categories").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  const { data: pCatData, error: pCatErr } = await supabase
    .from("product_categories")
    .insert(pCats.map((c) => ({ ...c, is_active: true })))
    .select();
  if (pCatErr) throw new Error(`Product categories: ${pCatErr.message}`);
  console.log(`  ✓ ${pCatData.length} product categories`);

  const pCatId = (name: string) => pCatData.find((c) => c.name === name)?.id;

  // Products
  console.log("\n→ Creating products...");
  const products = [
    {
      name: "Vitamin C Brightening Serum",
      category_id: pCatId("Skincare"),
      description:
        "15% stabilised Vitamin C with ferulic acid and niacinamide. Fades dark spots, boosts collagen, and delivers a luminous glow with daily use.",
      sku: "GBM-SK-001",
      price: 48,
      cost_price: 18,
      stock_quantity: 45,
      low_stock_threshold: 10,
      image_url: imageUrls["vitamin-c-serum"] ?? null,
      is_for_sale: true,
    },
    {
      name: "Hyaluronic Acid Moisturiser",
      category_id: pCatId("Skincare"),
      description:
        "Lightweight gel-cream with triple-molecular-weight hyaluronic acid that delivers 72-hour moisture lock without feeling heavy.",
      sku: "GBM-SK-002",
      price: 42,
      cost_price: 15,
      stock_quantity: 60,
      low_stock_threshold: 12,
      image_url: imageUrls["hyaluronic-moisturizer"] ?? null,
      is_for_sale: true,
    },
    {
      name: "Gentle Foaming Cleanser",
      category_id: pCatId("Skincare"),
      description:
        "pH-balanced, sulphate-free foaming cleanser that removes makeup and impurities without stripping the skin's natural barrier.",
      sku: "GBM-SK-003",
      price: 28,
      cost_price: 9,
      stock_quantity: 80,
      low_stock_threshold: 15,
      image_url: imageUrls["foaming-cleanser"] ?? null,
      is_for_sale: true,
    },
    {
      name: "Rose Hip Facial Oil",
      category_id: pCatId("Skincare"),
      description:
        "Cold-pressed, 100% pure rosehip seed oil rich in Vitamin A and essential fatty acids. Repairs, firms, and visibly reduces scarring.",
      sku: "GBM-SK-004",
      price: 52,
      cost_price: 20,
      stock_quantity: 30,
      low_stock_threshold: 8,
      image_url: imageUrls["rosehip-facial-oil"] ?? null,
      is_for_sale: true,
    },
    {
      name: "SPF 50 Daily Sunscreen",
      category_id: pCatId("Skincare"),
      description:
        "Broad-spectrum UVA/UVB mineral sunscreen with zinc oxide. Invisible finish, water-resistant, and reef-safe. Wear every day.",
      sku: "GBM-SK-005",
      price: 35,
      cost_price: 12,
      stock_quantity: 55,
      low_stock_threshold: 12,
      image_url: imageUrls["daily-sunscreen"] ?? null,
      is_for_sale: true,
    },
    {
      name: "Retinol Night Renewal Cream",
      category_id: pCatId("Skincare"),
      description:
        "Encapsulated 0.3% retinol with squalane and ceramides for overnight cell turnover — visible smoothing with minimal irritation.",
      sku: "GBM-SK-006",
      price: 58,
      cost_price: 22,
      stock_quantity: 35,
      low_stock_threshold: 8,
      image_url: imageUrls["retinol-night-cream"] ?? null,
      is_for_sale: true,
    },
    {
      name: "Exfoliating Sugar Scrub",
      category_id: pCatId("Skincare"),
      description:
        "Fine-grain cane sugar scrub blended with jojoba beads and mandelic acid. Buffs away dead cells to reveal brighter, smoother skin.",
      sku: "GBM-SK-007",
      price: 32,
      cost_price: 10,
      stock_quantity: 40,
      low_stock_threshold: 10,
      image_url: imageUrls["sugar-scrub"] ?? null,
      is_for_sale: true,
    },
    {
      name: "Eye Revive Cream",
      category_id: pCatId("Skincare"),
      description:
        "Caffeine + peptide formula that deflates puffiness, brightens dark circles, and firms the delicate eye contour in 4 weeks.",
      sku: "GBM-SK-008",
      price: 45,
      cost_price: 16,
      stock_quantity: 28,
      low_stock_threshold: 8,
      image_url: imageUrls["eye-revive-cream"] ?? null,
      is_for_sale: true,
    },
    {
      name: "Keratin Repair Shampoo",
      category_id: pCatId("Haircare"),
      description:
        "Sulphate-free shampoo infused with hydrolysed keratin proteins and argan oil to reconstruct damaged bonds and restore natural lustre.",
      sku: "GBM-HC-001",
      price: 28,
      cost_price: 9,
      stock_quantity: 50,
      low_stock_threshold: 10,
      image_url: imageUrls["keratin-shampoo"] ?? null,
      is_for_sale: true,
    },
    {
      name: "Deep Moisture Hair Mask",
      category_id: pCatId("Haircare"),
      description:
        "Weekly intensive mask with shea butter, coconut oil, and silk amino acids. Restores elasticity and eliminates frizz for 7 days.",
      sku: "GBM-HC-002",
      price: 36,
      cost_price: 12,
      stock_quantity: 38,
      low_stock_threshold: 8,
      image_url: imageUrls["hair-mask"] ?? null,
      is_for_sale: true,
    },
    {
      name: "Scalp Balance Tonic",
      category_id: pCatId("Haircare"),
      description:
        "Lightweight daily spray tonic with salicylic acid, zinc pyrithione, and peppermint. Regulates oil, calms irritation, and promotes hair growth.",
      sku: "GBM-HC-003",
      price: 30,
      cost_price: 10,
      stock_quantity: 42,
      low_stock_threshold: 10,
      image_url: imageUrls["scalp-tonic"] ?? null,
      is_for_sale: true,
    },
    {
      name: "Lavender Body Lotion",
      category_id: pCatId("Body Care"),
      description:
        "Velvety body lotion with shea butter, vitamin E, and therapeutic lavender essential oil. Absorbs fast, no greasy residue.",
      sku: "GBM-BC-001",
      price: 26,
      cost_price: 8,
      stock_quantity: 65,
      low_stock_threshold: 15,
      image_url: imageUrls["body-lotion"] ?? null,
      is_for_sale: true,
    },
    {
      name: "Detoxifying Body Scrub",
      category_id: pCatId("Body Care"),
      description:
        "Activated charcoal and coffee-ground exfoliant that draws out toxins, smooths cellulite, and leaves the skin perfectly prepped for moisturiser.",
      sku: "GBM-BC-002",
      price: 34,
      cost_price: 11,
      stock_quantity: 48,
      low_stock_threshold: 10,
      image_url: imageUrls["body-scrub"] ?? null,
      is_for_sale: true,
    },
    {
      name: "Jade Facial Roller",
      category_id: pCatId("Tools & Accessories"),
      description:
        "Genuine nephrite jade double-ended roller. Use daily to depuff, improve product absorption, and promote lymphatic drainage.",
      sku: "GBM-TA-001",
      price: 28,
      cost_price: 8,
      stock_quantity: 25,
      low_stock_threshold: 5,
      image_url: imageUrls["jade-roller"] ?? null,
      is_for_sale: true,
    },
    {
      name: "Gua Sha Stone Set",
      category_id: pCatId("Tools & Accessories"),
      description:
        "Set of two rose quartz gua sha stones — one for the face and one for the neck — with a velvet carry pouch and instructional guide.",
      sku: "GBM-TA-002",
      price: 32,
      cost_price: 10,
      stock_quantity: 20,
      low_stock_threshold: 5,
      image_url: imageUrls["gua-sha"] ?? null,
      is_for_sale: true,
    },
  ];

  const { data: prodData, error: prodErr } = await supabase
    .from("products")
    .insert(products.map((p) => ({ ...p, is_active: true })))
    .select();

  if (prodErr) throw new Error(`Products: ${prodErr.message}`);
  console.log(`  ✓ ${prodData.length} products`);
}

async function seedBusinessSettings(adminId: string) {
  console.log("\n→ Seeding business settings...");

  const settings = [
    {
      key: "business_info",
      value: {
        name: "Glow By Miral",
        tagline: "Your beauty, our passion",
        email: "hello@glowbymiral.com",
        phone: "+1 (555) 100-2000",
        address: "42 Blossom Lane, Suite 3, Beverly Hills, CA 90210",
        website: "https://glowbymiral.com",
        timezone: "America/Los_Angeles",
        currency: "USD",
      },
      updated_by: adminId,
    },
    {
      key: "working_hours",
      value: {
        0: { open: false, start: "09:00", end: "18:00" },
        1: { open: true, start: "09:00", end: "18:00" },
        2: { open: true, start: "09:00", end: "18:00" },
        3: { open: true, start: "09:00", end: "20:00" },
        4: { open: true, start: "09:00", end: "20:00" },
        5: { open: true, start: "09:00", end: "18:00" },
        6: { open: true, start: "10:00", end: "16:00" },
      },
      updated_by: adminId,
    },
    {
      key: "notification_settings",
      value: {
        appointment_reminder_hours: 24,
        send_confirmation_email: true,
        send_reminder_sms: false,
        notify_admin_on_booking: true,
      },
      updated_by: adminId,
    },
    {
      key: "booking_settings",
      value: {
        min_advance_hours: 2,
        max_advance_days: 60,
        allow_customer_cancel_hours: 24,
        slot_interval_mins: 15,
      },
      updated_by: adminId,
    },
  ];

  // Remove existing keys before re-inserting
  await supabase
    .from("business_settings")
    .delete()
    .in(
      "key",
      settings.map((s) => s.key),
    );
  const { error } = await supabase.from("business_settings").insert(settings);
  if (error) throw new Error(`Business settings: ${error.message}`);
  console.log(`  ✓ ${settings.length} settings entries`);
}

// ─────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────
async function seedTreatmentPlanTemplates() {
  console.log("\n→ Seeding treatment plan templates...");

  await supabase.from("treatment_plan_templates").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  const templates = [
    // ── 30-day ──────────────────────────────────────────────────────────────
    {
      name: "30-Day Glow Skin Reset",
      description:
        "A one-month intensive designed to deeply cleanse, resurface, and brighten dull or congested skin. Combines professional treatments with a structured home-care routine.",
      duration_days: 30,
      is_active: true,
      steps: [
        {
          day: 1,
          title: "Initial Skin Assessment & Deep Cleanse",
          description:
            "Perform a full skin analysis, photograph baseline condition, and complete a 60-minute deep-cleansing facial to remove congestion and prepare the skin for active treatment.",
          recommended_products: ["Gentle Foaming Cleanser", "Hyaluronic Acid Moisturiser"],
        },
        {
          day: 3,
          title: "Home-Care Protocol Introduction",
          description:
            "Walk the client through their prescribed home-care regimen — morning Vitamin C serum, SPF 50+, and evening double-cleanse with hyaluronic moisturiser. Set realistic expectations for the first week.",
          recommended_products: [
            "Vitamin C Brightening Serum",
            "Hyaluronic Acid Moisturiser",
            "Gentle Foaming Cleanser",
          ],
        },
        {
          day: 7,
          title: "Enzyme Exfoliation Treatment",
          description:
            "Apply a papaya or pineapple enzyme mask for 15 minutes to dissolve dead skin cells without causing irritation. Follow with a soothing LED red-light session (10 minutes).",
        },
        {
          day: 14,
          title: "Mid-Program Check-In & Light Chemical Peel",
          description:
            "Assess progress against baseline photographs. Administer a 20% lactic acid peel (leave on 5 minutes) to accelerate cell turnover. Neutralise and apply post-peel barrier cream.",
          recommended_products: ["Hyaluronic Acid Moisturiser"],
        },
        {
          day: 21,
          title: "Brightening Facial & Vitamin Infusion",
          description:
            "Perform a 75-minute brightening facial using niacinamide and Vitamin C serums under steam. Use a micro-current device to improve lymphatic drainage and product penetration.",
          recommended_products: ["Vitamin C Brightening Serum"],
        },
        {
          day: 28,
          title: "Final Assessment & Maintenance Plan",
          description:
            "Compare before-and-after photographs, document improvement in tone and texture, and prescribe a long-term maintenance plan with monthly facial top-ups and daily SPF compliance.",
          recommended_products: ["Vitamin C Brightening Serum", "Hyaluronic Acid Moisturiser"],
        },
      ],
    },
    {
      name: "30-Day Hydration Rescue",
      description:
        "Targets severely dehydrated, sensitised, or barrier-compromised skin. Every step prioritises moisture restoration and skin-barrier repair before introducing any active ingredients.",
      duration_days: 30,
      is_active: true,
      steps: [
        {
          day: 1,
          title: "Barrier Assessment & Hydrating Facial",
          description:
            "Evaluate transepidermal water loss (TEWL) via visual assessment. Perform a 60-minute hydration infusion facial using hyaluronic acid and ceramide sheet masks.",
          recommended_products: ["Hyaluronic Acid Moisturiser", "Gentle Foaming Cleanser"],
        },
        {
          day: 4,
          title: "Home Routine Coaching",
          description:
            "Introduce a barrier-safe home routine: fragrance-free cleanser, ceramide moisturiser applied to damp skin morning and evening. Advise avoiding hot showers and harsh actives for 2 weeks.",
          recommended_products: ["Gentle Foaming Cleanser", "Hyaluronic Acid Moisturiser"],
        },
        {
          day: 10,
          title: "Calming & Replenishing Treatment",
          description:
            "Apply a 20-minute oat and aloe vera mask to reduce redness. Follow with high-frequency galvanic current to drive hyaluronic acid deeper into the dermis.",
          recommended_products: ["Hyaluronic Acid Moisturiser"],
        },
        {
          day: 20,
          title: "Hydration Progress Review",
          description:
            "Review skin elasticity and plumpness. If barrier is sufficiently rebuilt, introduce a low-concentration (5%) niacinamide serum. Continue rich overnight moisturiser.",
          recommended_products: ["Hyaluronic Acid Moisturiser"],
        },
        {
          day: 30,
          title: "Closing Hydration Infusion & Long-Term Plan",
          description:
            "Closing 60-minute facial focusing on lymphatic drainage and moisture lock. Prescribe quarterly hydration facials and a simplified 3-step home routine.",
          recommended_products: ["Hyaluronic Acid Moisturiser", "Gentle Foaming Cleanser"],
        },
      ],
    },
    {
      name: "30-Day Post-Sun Recovery",
      description:
        "Designed for clients presenting with sun damage, heat-induced sensitivity, or post-holiday dullness. Calms inflammation, fades early hyperpigmentation, and restores skin clarity.",
      duration_days: 30,
      is_active: true,
      steps: [
        {
          day: 1,
          title: "Damage Assessment & Cooling Facial",
          description:
            "Assess UV damage, active inflammation, and pigmentation pattern. Apply a cooling aloe-based facial with chilled jade rollers and a calming green-tea sheet mask.",
          recommended_products: ["Gentle Foaming Cleanser", "Jade Facial Roller"],
        },
        {
          day: 5,
          title: "Anti-Inflammatory Home Protocol",
          description:
            "Prescribe antioxidant-rich Vitamin C serum (morning), gentle cleanser, and rich moisturiser. Reinforce mandatory daily SPF 50+ — explain the role of antioxidants in preventing further photo-damage.",
          recommended_products: [
            "Vitamin C Brightening Serum",
            "Hyaluronic Acid Moisturiser",
            "Gentle Foaming Cleanser",
          ],
        },
        {
          day: 12,
          title: "Brightening Enzyme Peel",
          description:
            "Once active inflammation is resolved, apply a mild enzyme peel to lift dead, sun-damaged cells. Follow with LED red-light (10 minutes) to stimulate collagen repair.",
          recommended_products: ["Vitamin C Brightening Serum"],
        },
        {
          day: 22,
          title: "Vitamin Infusion & Pigmentation Treatment",
          description:
            "Targeted niacinamide and kojic acid serum applied under ultrasound to address early melanin clusters. Jade-roller massage to improve microcirculation.",
          recommended_products: ["Vitamin C Brightening Serum", "Jade Facial Roller"],
        },
        {
          day: 30,
          title: "Final Glow Facial & Prevention Coaching",
          description:
            "Closing brightening facial. Document improvement in hyperpigmentation. Educate client on year-round SPF habits and the 4-monthly antioxidant facial schedule.",
          recommended_products: ["Vitamin C Brightening Serum", "Hyaluronic Acid Moisturiser"],
        },
      ],
    },
    {
      name: "30-Day Keratin Hair Recovery",
      description:
        "Intensive one-month plan for chemically over-processed, heat-damaged, or brittle hair. Rebuilds the protein structure from root to tip with in-salon treatments and a strict home regimen.",
      duration_days: 30,
      is_active: true,
      steps: [
        {
          day: 1,
          title: "Hair & Scalp Assessment",
          description:
            "Evaluate porosity, elasticity, and breakage. Clarify with a chelating shampoo, then apply a 20-minute deep keratin conditioning mask under a steamer hood.",
          recommended_products: ["Keratin Smoothing Shampoo", "Deep Moisture Hair Mask"],
        },
        {
          day: 3,
          title: "Home Regimen Start",
          description:
            "Begin sulphate-free keratin shampoo and weekly deep-conditioning mask at home. Advise no heat tools above 180°C and use of a heat-protectant spray before every styling session.",
          recommended_products: ["Keratin Smoothing Shampoo", "Deep Moisture Hair Mask"],
        },
        {
          day: 10,
          title: "Scalp Detox & Strengthening Treatment",
          description:
            "Apply a scalp detox scrub to remove product build-up, followed by a scalp balance tonic massage. Perform an in-salon bond-repair treatment on mid-lengths and ends.",
          recommended_products: ["Scalp Balance Tonic", "Keratin Smoothing Shampoo"],
        },
        {
          day: 20,
          title: "Mid-Program Protein Infusion",
          description:
            "Administer a professional hydrolysed keratin protein treatment with heat activation (30 minutes). Assess elasticity improvement versus Day 1 baseline.",
          recommended_products: ["Deep Moisture Hair Mask", "Keratin Smoothing Shampoo"],
        },
        {
          day: 30,
          title: "Closing Gloss Treatment & Maintenance Plan",
          description:
            "Apply a high-shine gloss treatment to seal the cuticle. Photograph and compare results. Prescribe monthly deep-conditioning mask sessions and bi-monthly in-salon protein treatments.",
          recommended_products: ["Keratin Smoothing Shampoo", "Deep Moisture Hair Mask", "Scalp Balance Tonic"],
        },
      ],
    },

    // ── 60-day ──────────────────────────────────────────────────────────────
    {
      name: "60-Day Anti-Aging Collagen Boost",
      description:
        "A structured two-month program combining professional collagen-stimulating treatments with science-backed home care to visibly reduce fine lines, improve skin firmness, and restore a youthful glow.",
      duration_days: 60,
      is_active: true,
      steps: [
        {
          day: 1,
          title: "Baseline Assessment & Collagen Facial",
          description:
            "Photograph and document fine lines, sagging areas, and skin texture. Perform a 90-minute collagen-stimulating facial using retinol serum, peptide ampoules, and microcurrent lifting.",
          recommended_products: ["Retinol Night Repair Serum", "Hyaluronic Acid Moisturiser"],
        },
        {
          day: 5,
          title: "Home Protocol — Introduce Retinol",
          description:
            "Begin retinol 0.3% every third night on clean, dry skin. Use barrier moisturiser on top. Reinforce morning SPF 50+ as retinol increases photosensitivity.",
          recommended_products: ["Retinol Night Repair Serum", "Hyaluronic Acid Moisturiser"],
        },
        {
          day: 14,
          title: "Microneedling or Dermaroller Session",
          description:
            "Perform a professional micro-needling session (0.5 mm) to stimulate fibroblast activity and natural collagen production. Apply a peptide serum immediately after.",
          recommended_products: ["Hyaluronic Acid Moisturiser"],
        },
        {
          day: 21,
          title: "Retinol Upgrade & LED Therapy",
          description:
            "If tolerating 0.3% well, upgrade to 0.5% retinol (every other night). Perform a 20-minute LED red-light session to further stimulate collagen without downtime.",
          recommended_products: ["Retinol Night Repair Serum", "Hyaluronic Acid Moisturiser"],
        },
        {
          day: 30,
          title: "Mid-Program Review & Radio Frequency Lift",
          description:
            "Compare photographs, document improvement in fine lines and firmness. Perform a 45-minute radio-frequency skin-tightening treatment on the jawline and cheeks.",
          recommended_products: ["Retinol Night Repair Serum"],
        },
        {
          day: 42,
          title: "Second Microneedling Session",
          description:
            "Repeat micro-needling (0.75 mm) for enhanced collagen induction. Apply a growth-factor serum post-treatment. Advise 48-hour gentle-only routine.",
          recommended_products: ["Hyaluronic Acid Moisturiser", "Gentle Foaming Cleanser"],
        },
        {
          day: 52,
          title: "Peptide Infusion Facial",
          description:
            "Perform a 75-minute peptide-rich facial with ultrasound to maximise product penetration. Focus on nasolabial folds and under-eye area.",
          recommended_products: ["Hyaluronic Acid Moisturiser", "Retinol Night Repair Serum"],
        },
        {
          day: 60,
          title: "Final Assessment & Maintenance Prescription",
          description:
            "Document final results and compare against baseline. Prescribe monthly maintenance facials, continued home retinol protocol, and a quarterly micro-needling schedule.",
          recommended_products: ["Retinol Night Repair Serum", "Hyaluronic Acid Moisturiser"],
        },
      ],
    },
    {
      name: "60-Day Brightening & Pigmentation Correction",
      description:
        "Targets melasma, post-inflammatory hyperpigmentation (PIH), and sun spots using a layered approach of chemical exfoliation, targeted serums, and brightening facials.",
      duration_days: 60,
      is_active: true,
      steps: [
        {
          day: 1,
          title: "Pigmentation Mapping & First Peel",
          description:
            "Photograph and classify pigmentation type (melasma vs PIH vs sun spots). Perform a 20% mandelic acid peel to begin lifting surface pigment with minimal irritation.",
          recommended_products: ["Vitamin C Brightening Serum", "Gentle Foaming Cleanser"],
        },
        {
          day: 5,
          title: "Brightening Home Routine Start",
          description:
            "Introduce daily Vitamin C serum (morning), niacinamide 10% (evening), gentle cleanser, and mandatory SPF 50+. Stress that SPF is non-negotiable — UV exposure will undo all progress.",
          recommended_products: [
            "Vitamin C Brightening Serum",
            "Hyaluronic Acid Moisturiser",
            "Gentle Foaming Cleanser",
          ],
        },
        {
          day: 14,
          title: "Brightening Facial & Enzyme Exfoliation",
          description:
            "Perform a 60-minute brightening facial with papaya enzyme exfoliation and a kojic acid brightening mask. Use LED yellow-light (10 minutes) to calm post-inflammatory redness.",
          recommended_products: ["Vitamin C Brightening Serum"],
        },
        {
          day: 21,
          title: "Second Chemical Peel — Stronger",
          description:
            "Upgrade to a 30% mandelic or 20% glycolic acid peel as the skin has acclimatised. Apply for 3–5 minutes; monitor for even frosting. Neutralise and follow with a barrier repair mask.",
          recommended_products: ["Hyaluronic Acid Moisturiser"],
        },
        {
          day: 30,
          title: "Mid-Program Pigmentation Check",
          description:
            "Compare photographs. Document fading progress. Continue peel series (every 2 weeks). If melasma is present, discuss the role of hormonal triggers and reinforce lifestyle adjustments.",
          recommended_products: ["Vitamin C Brightening Serum"],
        },
        {
          day: 42,
          title: "Third Peel & Targeted Spot Treatment",
          description:
            "Third in-salon peel session. Apply targeted kojic acid spot serum to persistent dark patches using a fine brush post-peel.",
          recommended_products: ["Vitamin C Brightening Serum", "Hyaluronic Acid Moisturiser"],
        },
        {
          day: 54,
          title: "Ultrasound Serum Infusion",
          description:
            "Use an ultrasound device to drive a blend of Vitamin C, kojic acid, and niacinamide deep into the dermis for maximum efficacy on stubborn pigmentation.",
          recommended_products: ["Vitamin C Brightening Serum"],
        },
        {
          day: 60,
          title: "Final Review & Maintenance Protocol",
          description:
            "Final comparison of before-and-after photographs. Prescribe ongoing monthly peels, daily SPF compliance, and Vitamin C serum for long-term pigmentation maintenance.",
          recommended_products: ["Vitamin C Brightening Serum", "Hyaluronic Acid Moisturiser"],
        },
      ],
    },
    {
      name: "60-Day Scalp Health & Hair Growth",
      description:
        "A science-based two-month plan for clients experiencing hair thinning, oiliness, dandruff, or scalp sensitivity. Addresses the root cause at follicle level while improving overall hair density.",
      duration_days: 60,
      is_active: true,
      steps: [
        {
          day: 1,
          title: "Trichological Assessment",
          description:
            "Evaluate scalp condition, hair density, oiliness, and shedding pattern. Perform a clarifying scalp detox treatment and a scalp-stimulating massage with tonic.",
          recommended_products: ["Scalp Balance Tonic", "Keratin Smoothing Shampoo"],
        },
        {
          day: 4,
          title: "Home Scalp Routine",
          description:
            "Introduce scalp balance tonic (applied to parting lines nightly with a dropper). Prescribe anti-dandruff or balancing shampoo based on assessment findings. Avoid over-washing (max 3× per week).",
          recommended_products: ["Scalp Balance Tonic", "Keratin Smoothing Shampoo"],
        },
        {
          day: 14,
          title: "Scalp Exfoliation & LED Session",
          description:
            "Perform a professional scalp scrub with salicylic acid to unclog follicles. Follow with a 15-minute LED red-light session to stimulate hair follicle activity and circulation.",
          recommended_products: ["Scalp Balance Tonic"],
        },
        {
          day: 21,
          title: "Peptide & Growth Factor Treatment",
          description:
            "Apply a professional peptide and biotin growth-factor cocktail directly to the scalp using micro-needling (0.25 mm dermaroller). The micro-channels maximise absorption of active ingredients.",
          recommended_products: ["Scalp Balance Tonic", "Keratin Smoothing Shampoo"],
        },
        {
          day: 35,
          title: "Mid-Program Density Review",
          description:
            "Photograph scalp under magnification and compare hair density. Assess if follicle inflammation has resolved. Adjust tonic formulation or frequency based on progress.",
          recommended_products: ["Scalp Balance Tonic"],
        },
        {
          day: 45,
          title: "Second Growth Factor Micro-Needling",
          description:
            "Repeat growth-factor micro-needling session. Apply a 30-minute deep-conditioning mask to the lengths and ends while the scalp treatment works.",
          recommended_products: ["Scalp Balance Tonic", "Deep Moisture Hair Mask"],
        },
        {
          day: 55,
          title: "Strengthening Keratin Treatment",
          description:
            "Administer a keratin protein bond-building treatment on lengths and ends to complement the scalp work and improve overall hair structural integrity.",
          recommended_products: ["Keratin Smoothing Shampoo", "Deep Moisture Hair Mask"],
        },
        {
          day: 60,
          title: "Final Assessment & Ongoing Strategy",
          description:
            "Final density photographs and shedding count. Prescribe monthly scalp treatments, continued nightly tonic, and a quarterly keratin service for sustained results.",
          recommended_products: ["Scalp Balance Tonic", "Keratin Smoothing Shampoo", "Deep Moisture Hair Mask"],
        },
      ],
    },
    {
      name: "60-Day Sensitive Skin Repair",
      description:
        "A gentle but progressive plan for redness-prone, reactive, or rosacea-adjacent skin. Eliminates triggers, rebuilds the skin barrier, and introduces actives only once tolerance is established.",
      duration_days: 60,
      is_active: true,
      steps: [
        {
          day: 1,
          title: "Sensitivity Assessment & Calming Facial",
          description:
            "Identify triggers (fragrance, heat, products, diet). Perform a 60-minute calming facial using oat extract, centella asiatica, and a cool jade-roller massage to reduce erythema.",
          recommended_products: ["Gentle Foaming Cleanser", "Hyaluronic Acid Moisturiser", "Jade Facial Roller"],
        },
        {
          day: 3,
          title: "Simplified Home Routine",
          description:
            "Strip routine to 3 steps: fragrance-free gentle cleanser, barrier moisturiser (twice daily), mineral SPF 50+. Eliminate all actives. Remove identified triggers from diet and skincare.",
          recommended_products: ["Gentle Foaming Cleanser", "Hyaluronic Acid Moisturiser"],
        },
        {
          day: 14,
          title: "Barrier Check & Jade Roller Facial",
          description:
            "Assess whether redness has reduced. Perform a 45-minute treatment using soothing sheet masks and gua sha technique with jade roller. No steam or heat this session.",
          recommended_products: ["Hyaluronic Acid Moisturiser", "Jade Facial Roller"],
        },
        {
          day: 28,
          title: "Introduction of Low-Dose Niacinamide",
          description:
            "If skin is stable, introduce 5% niacinamide in the evening routine. Perform a brief patch test during the session before sending home. Continue gentle cleanser and barrier moisturiser.",
          recommended_products: ["Hyaluronic Acid Moisturiser", "Gentle Foaming Cleanser"],
        },
        {
          day: 40,
          title: "LED Red-Light Anti-Inflammatory Session",
          description:
            "Perform a 20-minute LED red-light session to reduce inflammation and stimulate repair without any chemical contact. Excellent for rosacea-prone clients at this stage.",
          recommended_products: ["Hyaluronic Acid Moisturiser"],
        },
        {
          day: 52,
          title: "Gentle Brightening Introduction",
          description:
            "If redness is consistently managed, introduce Vitamin C at 10% concentration (lower than standard) every other morning. Monitor for flush reactions over 48 hours.",
          recommended_products: ["Vitamin C Brightening Serum", "Hyaluronic Acid Moisturiser"],
        },
        {
          day: 60,
          title: "Final Assessment & Trigger Management Plan",
          description:
            "Final review with photographs. Provide a written trigger-management plan and long-term maintenance facial schedule (every 6–8 weeks) to sustain the barrier repair achieved.",
          recommended_products: ["Gentle Foaming Cleanser", "Hyaluronic Acid Moisturiser"],
        },
      ],
    },
    {
      name: "60-Day Body Contouring & Firming",
      description:
        "Targets localised fat deposits, cellulite, and skin laxity on the body using a combination of professional body treatments and an active home-care ritual for measurable inch-loss.",
      duration_days: 60,
      is_active: true,
      steps: [
        {
          day: 1,
          title: "Measurements & Lymphatic Drainage Massage",
          description:
            "Record baseline measurements (waist, hips, thighs, upper arms). Perform a 60-minute lymphatic drainage massage to reduce water retention and activate the lymphatic system.",
          recommended_products: ["Lavender Body Lotion"],
        },
        {
          day: 4,
          title: "Home Body Ritual Introduction",
          description:
            "Introduce daily dry-body brushing (pre-shower, 5 minutes) and targeted firming massage with body lotion morning and evening. Advise on hydration — minimum 2L water per day.",
          recommended_products: ["Detoxifying Body Scrub", "Lavender Body Lotion"],
        },
        {
          day: 10,
          title: "Body Exfoliation & Wrap",
          description:
            "Perform a full-body exfoliation using the detoxifying body scrub, then apply a slimming seaweed body wrap for 30 minutes under thermal blanket to boost metabolism and detoxify.",
          recommended_products: ["Detoxifying Body Scrub", "Lavender Body Lotion"],
        },
        {
          day: 20,
          title: "Radio Frequency Body Contouring",
          description:
            "Target agreed problem areas with radio-frequency body contouring to heat subcutaneous tissue, stimulate collagen, and reduce the appearance of cellulite.",
          recommended_products: ["Lavender Body Lotion"],
        },
        {
          day: 30,
          title: "Mid-Program Measurements & Massage",
          description:
            "Remeasure and document inch-loss progress. Perform a second lymphatic drainage session. Adjust intensity of home dry-brushing if client reports sensitivity.",
          recommended_products: ["Lavender Body Lotion"],
        },
        {
          day: 42,
          title: "Second RF Contouring & Wrap",
          description:
            "Second radio-frequency session targeting persistent areas. Follow with a detoxifying body wrap and light massage.",
          recommended_products: ["Detoxifying Body Scrub", "Lavender Body Lotion"],
        },
        {
          day: 55,
          title: "Firming Wrap & Gua Sha Body Massage",
          description:
            "Firming coffee-and-clay wrap (30 minutes) followed by gua sha body massage along the thighs and abdomen to break up fascial restrictions and smooth skin texture.",
          recommended_products: ["Detoxifying Body Scrub", "Lavender Body Lotion"],
        },
        {
          day: 60,
          title: "Final Measurements & Maintenance Strategy",
          description:
            "Final measurements and photograph comparison. Prescribe ongoing monthly body treatments, continued dry-brushing practice, and seasonal body wraps.",
          recommended_products: ["Lavender Body Lotion", "Detoxifying Body Scrub"],
        },
      ],
    },

    // ── 90-day ──────────────────────────────────────────────────────────────
    {
      name: "90-Day Acne Clearing Program",
      description:
        "A comprehensive three-month protocol for mild-to-moderate acne. Combines professional extractions, chemical exfoliation, and bacteria-targeting LED therapy with a tightly managed home routine.",
      duration_days: 90,
      is_active: true,
      steps: [
        {
          day: 1,
          title: "Acne Assessment & First Clear-Out Facial",
          description:
            "Classify acne grade, map breakout zones, and photograph baseline. Perform a 75-minute acne facial with professional steam, extractions, salicylic spot treatment, and LED blue-light therapy.",
          recommended_products: ["Gentle Foaming Cleanser", "Hyaluronic Acid Moisturiser"],
        },
        {
          day: 3,
          title: "Anti-Acne Home Routine",
          description:
            "Introduce twice-daily gentle cleanser, oil-free moisturiser, and niacinamide 10% serum. Evening-only BHA (2% salicylic acid) on breakout zones. Strict no-touching rule for active lesions.",
          recommended_products: ["Gentle Foaming Cleanser", "Hyaluronic Acid Moisturiser"],
        },
        {
          day: 14,
          title: "BHA Peel Session",
          description:
            "Perform a professional 20% salicylic acid peel to decongest pores and reduce comedones. Follow with LED blue-light (15 minutes) to kill P. acnes bacteria.",
          recommended_products: ["Gentle Foaming Cleanser"],
        },
        {
          day: 21,
          title: "Extraction & Hydration Facial",
          description:
            "Manual extraction of whiteheads and closed comedones after thorough steaming. Apply a post-extraction hydrating sheet mask to calm skin and prevent post-inflammatory dryness.",
          recommended_products: ["Hyaluronic Acid Moisturiser"],
        },
        {
          day: 35,
          title: "Mid-Program Acne Grade Review",
          description:
            "Photograph and compare with baseline. Assess severity trend. If significantly improved, introduce low-dose Vitamin C morning serum to begin addressing PIH. Maintain BHA peel series.",
          recommended_products: ["Vitamin C Brightening Serum", "Gentle Foaming Cleanser"],
        },
        {
          day: 42,
          title: "Third BHA Peel & LED Combo",
          description:
            "Third professional peel session (25% salicylic if tolerating well). Extended LED combination blue + red light (20 minutes) to target bacteria and promote healing simultaneously.",
          recommended_products: ["Gentle Foaming Cleanser", "Hyaluronic Acid Moisturiser"],
        },
        {
          day: 56,
          title: "Scar & PIH Brightening Session",
          description:
            "As active acne diminishes, shift focus to post-acne scarring. Micro-needling (0.5 mm) with a Vitamin C and niacinamide serum to stimulate collagen and fade PIH.",
          recommended_products: ["Vitamin C Brightening Serum", "Hyaluronic Acid Moisturiser"],
        },
        {
          day: 70,
          title: "Sebum Regulation Treatment",
          description:
            "Apply a professional sebum-regulation mask and use high-frequency ozone treatment to sterilise remaining congestion. Introduce scalp balance tonic if back or chest acne is also present.",
          recommended_products: ["Gentle Foaming Cleanser", "Scalp Balance Tonic"],
        },
        {
          day: 84,
          title: "Second Micro-Needling for Scars",
          description:
            "Repeat micro-needling for scar reduction. Apply a 20-minute post-treatment LED red-light session to maximise healing response.",
          recommended_products: ["Hyaluronic Acid Moisturiser", "Vitamin C Brightening Serum"],
        },
        {
          day: 90,
          title: "Final Clearance Review & Long-Term Plan",
          description:
            "Compare full photographic timeline. Confirm acne grade reduction. Prescribe maintenance monthly facials, continued BHA toner 3× per week, and a diet/lifestyle advisory document.",
          recommended_products: [
            "Gentle Foaming Cleanser",
            "Hyaluronic Acid Moisturiser",
            "Vitamin C Brightening Serum",
          ],
        },
      ],
    },
    {
      name: "90-Day Bridal Skin Preparation",
      description:
        "The complete pre-wedding skin program beginning 3 months before the big day. Delivers a radiant, smooth, even-toned complexion for the wedding date with zero downtime in the final two weeks.",
      duration_days: 90,
      is_active: true,
      steps: [
        {
          day: 1,
          title: "Bridal Consultation & Skin Strategy",
          description:
            "Full skin analysis and discussion of the wedding timeline. Agree on target look (luminous and natural). Photograph baseline and create a treatment calendar. Begin Vitamin C and SPF home routine.",
          recommended_products: [
            "Vitamin C Brightening Serum",
            "Gentle Foaming Cleanser",
            "Hyaluronic Acid Moisturiser",
          ],
        },
        {
          day: 7,
          title: "First Brightening Peel",
          description:
            "20% lactic acid peel to begin exfoliating and brightening. Suitable as an opening treatment to gauge skin tolerance for subsequent peels.",
          recommended_products: ["Vitamin C Brightening Serum", "Hyaluronic Acid Moisturiser"],
        },
        {
          day: 21,
          title: "Micro-Needling Session 1",
          description:
            "Collagen induction micro-needling (0.5 mm) with peptide serum. Targets fine lines, uneven texture, and early pigmentation. Allow 5–7 days for skin to settle before social events.",
          recommended_products: ["Hyaluronic Acid Moisturiser"],
        },
        {
          day: 35,
          title: "Second Chemical Peel",
          description:
            "Upgrade to a 30% lactic + 10% mandelic combination peel for enhanced cell turnover and even skin tone across the full face.",
          recommended_products: ["Vitamin C Brightening Serum", "Hyaluronic Acid Moisturiser"],
        },
        {
          day: 45,
          title: "Mid-Program Bride Check-In",
          description:
            "Progress review photographs. Discuss dress fitting, stress levels (elevated cortisol increases breakout risk). Add a relaxing facial massage component to reduce tension.",
          recommended_products: ["Hyaluronic Acid Moisturiser", "Jade Facial Roller"],
        },
        {
          day: 56,
          title: "Micro-Needling Session 2",
          description:
            "Second micro-needling (0.75 mm) for deeper collagen stimulation. Specifically targets any remaining pigmentation clusters and forehead lines.",
          recommended_products: ["Hyaluronic Acid Moisturiser"],
        },
        {
          day: 65,
          title: "Retinol Introduction (Controlled)",
          description:
            "Begin 0.3% retinol every third night to accelerate cell turnover in the remaining weeks. Must be discontinued by Day 80 to allow skin to desensitise before the wedding.",
          recommended_products: ["Retinol Night Repair Serum", "Hyaluronic Acid Moisturiser"],
        },
        {
          day: 72,
          title: "Third Peel — Last Aggressive Treatment",
          description:
            "Final chemical peel allowed in the program. After this, only calming and hydrating treatments. Allow full 10 days post-peel recovery before any event.",
          recommended_products: ["Hyaluronic Acid Moisturiser", "Gentle Foaming Cleanser"],
        },
        {
          day: 80,
          title: "Stop Retinol — Switch to Maintenance",
          description:
            "Discontinue retinol. Switch to a purely nourishing and hydrating routine for the final 10 days. Begin jade roller morning ritual to reduce puffiness.",
          recommended_products: [
            "Hyaluronic Acid Moisturiser",
            "Vitamin C Brightening Serum",
            "Jade Facial Roller",
          ],
        },
        {
          day: 85,
          title: "Pre-Wedding Glow Facial",
          description:
            "75-minute hydrating, brightening, and lymphatic-draining facial. No peels, no needles. Focus on maximising radiance, firmness, and luminosity. Leave-on overnight mask applied to take home.",
          recommended_products: [
            "Hyaluronic Acid Moisturiser",
            "Vitamin C Brightening Serum",
            "Jade Facial Roller",
          ],
        },
        {
          day: 90,
          title: "Final Touch-Up & Wedding Day Advice",
          description:
            "Gentle 30-minute brightening and lymphatic massage treatment. Provide written guide for wedding-morning skin prep (apply serum, moisturise, then primer). Book a post-wedding recovery facial.",
          recommended_products: ["Hyaluronic Acid Moisturiser", "Vitamin C Brightening Serum"],
        },
      ],
    },
    {
      name: "90-Day Rosacea Management Program",
      description:
        "A long-term strategy for chronic rosacea sufferers. Systematically reduces redness, prevents flushing episodes, and progressively strengthens the skin barrier through gentle, evidence-based treatments.",
      duration_days: 90,
      is_active: true,
      steps: [
        {
          day: 1,
          title: "Rosacea Assessment & Trigger Audit",
          description:
            "Classify rosacea subtype (erythematotelangiectatic, papulopustular). Perform a full trigger audit (UV, heat, alcohol, spicy food, stress). Begin a calming facial using oat and centella extracts.",
          recommended_products: ["Gentle Foaming Cleanser", "Hyaluronic Acid Moisturiser", "Jade Facial Roller"],
        },
        {
          day: 3,
          title: "Rosacea-Safe Home Routine",
          description:
            "Prescribe a strictly rosacea-safe routine: fragrance-free micellar cleanser, ceramide-rich moisturiser, mineral SPF 50+ (tinted if preferred to neutralise redness). Zero actives for 4 weeks.",
          recommended_products: ["Gentle Foaming Cleanser", "Hyaluronic Acid Moisturiser"],
        },
        {
          day: 14,
          title: "Cooling Facial & Jade Roller Treatment",
          description:
            "60-minute cooling facial: cold hyaluronic sheet mask, chilled jade roller along lymphatic lines, no steam or heat. Introduce gua sha for gentle drainage without heat generation.",
          recommended_products: ["Hyaluronic Acid Moisturiser", "Jade Facial Roller"],
        },
        {
          day: 21,
          title: "LED Red-Light Therapy — Session 1",
          description:
            "First standalone LED red-light session (20 minutes at 630 nm). Clinical evidence supports red-light in reducing erythema and inflammation in rosacea without any heat stimulus.",
          recommended_products: ["Hyaluronic Acid Moisturiser"],
        },
        {
          day: 30,
          title: "Month 1 Review",
          description:
            "Photograph and compare. Assess flushing frequency over the past 30 days (client diary review). Introduce azelaic acid 10% as an evening spot treatment on persistent papules only.",
          recommended_products: ["Hyaluronic Acid Moisturiser", "Gentle Foaming Cleanser"],
        },
        {
          day: 42,
          title: "LED Session 2 & Calming Facial",
          description:
            "Second LED red-light session. Follow with a calming 45-minute facial using centella asiatica, bisabolol, and allantoin. No extraction — rosacea skin must not be traumatised.",
          recommended_products: ["Hyaluronic Acid Moisturiser", "Jade Facial Roller"],
        },
        {
          day: 56,
          title: "Barrier Reinforcement Facial",
          description:
            "If skin is tolerating the routine well, add a ceramide and fatty-acid infusion treatment using ultrasound. Ceramides delivered this way have measurable impact on TEWL reduction.",
          recommended_products: ["Hyaluronic Acid Moisturiser", "Gentle Foaming Cleanser"],
        },
        {
          day: 65,
          title: "Introduce Low-Dose Niacinamide",
          description:
            "Add 5% niacinamide to the evening routine — niacinamide reduces skin reactivity and improves barrier function over time. Monitor for 10 days before the next appointment.",
          recommended_products: ["Hyaluronic Acid Moisturiser"],
        },
        {
          day: 75,
          title: "LED Session 3 & Lymphatic Massage",
          description:
            "Third LED red-light session. Combine with a lymphatic drainage facial massage using jade roller to reduce persistent facial fluid retention and puffiness.",
          recommended_products: ["Hyaluronic Acid Moisturiser", "Jade Facial Roller"],
        },
        {
          day: 85,
          title: "Long-Term Tolerance Assessment",
          description:
            "Assess whether Vitamin C (10% L-ascorbic acid) is now tolerable — many rosacea clients can use it at this stage once the barrier is rebuilt. Patch-test during the session.",
          recommended_products: ["Vitamin C Brightening Serum", "Hyaluronic Acid Moisturiser"],
        },
        {
          day: 90,
          title: "Final Review & Lifetime Management Plan",
          description:
            "Full photographic comparison across the 90-day journey. Provide a written rosacea management plan covering trigger avoidance, seasonal adjustments, and a bi-monthly LED maintenance schedule.",
          recommended_products: ["Gentle Foaming Cleanser", "Hyaluronic Acid Moisturiser", "Jade Facial Roller"],
        },
      ],
    },
  ];

  const { data: tplData, error: tplErr } = await supabase
    .from("treatment_plan_templates")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .insert(templates as any[])
    .select();

  if (tplErr) throw new Error(`Treatment plan templates: ${tplErr.message}`);
  console.log(`  ✓ ${tplData.length} treatment plan templates`);
}

async function main() {
  console.log("╔═══════════════════════════════╗");
  console.log("║  Glow By Miral — DB Seeder    ║");
  console.log("╚═══════════════════════════════╝");
  console.log(`  Supabase: ${SUPABASE_URL}`);

  const users = await seedUsers();
  const adminUser = users.find((u) => u.role === "admin")!;
  const staffUsers = users.filter((u) => u.role === "staff");

  console.log("\n→ Creating staff profiles...");
  for (const s of staffUsers) {
    await seedStaffProfile(s.id, s.name);
  }

  await seedServices();
  await seedConsultationTemplates();
  await seedTreatmentPlanTemplates();
  await seedProducts();
  await seedBusinessSettings(adminUser.id);

  console.log("\n╔═══════════════════════════════╗");
  console.log("║  Seeding complete!            ║");
  console.log("╚═══════════════════════════════╝");
  console.log("\nLogin credentials (password: 1234qwer):");
  for (const u of users) {
    console.log(`  ${u.email.padEnd(26)} (${u.role} — ${u.name})`);
  }
}

main().catch((err) => {
  console.error("\n✗ Seed failed:", err.message);
  process.exit(1);
});
