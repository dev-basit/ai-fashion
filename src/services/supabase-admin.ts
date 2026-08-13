import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import { env } from "@/config/env";

/**
 * Service-role client that bypasses RLS and can use auth.admin APIs.
 * SERVER ONLY — never import into a client component.
 */
export function getAdminClient() {
  return createClient<Database>(env.supabase.url, env.supabase.secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
