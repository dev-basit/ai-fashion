import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import { env } from "@/config/env";

let adminClient: SupabaseClient<Database> | null = null;

/**
 * Service-role client that bypasses RLS and can use auth.admin APIs.
 * SERVER ONLY — never import into a client component.
 */
export function getAdminClient(): SupabaseClient<Database> {
  if (!adminClient) {
    adminClient = createClient<Database>(env.supabase.url, env.supabase.secretKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return adminClient;
}
