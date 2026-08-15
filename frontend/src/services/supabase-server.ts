import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/supabase";
import { config } from "@/config/config";

export async function getServerClient() {
  const cookieStore = await cookies();
  return createServerClient<Database>(config.supabase.url, config.supabase.publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from Server Component — cannot set cookies, ignore
        }
      },
    },
  });
}
