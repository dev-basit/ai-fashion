import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/supabase";
import { env } from "@/config/config";

let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function getBrowserClient() {
  if (!browserClient) {
    browserClient = createBrowserClient<Database>(env.supabase.url, env.supabase.publishableKey);
  }
  return browserClient;
}
