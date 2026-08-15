import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/supabase";
import { config } from "@/config/config";

let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function getBrowserClient() {
  if (!browserClient) {
    browserClient = createBrowserClient<Database>(config.supabase.url, config.supabase.publishableKey);
  }
  return browserClient;
}
