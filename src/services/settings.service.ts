import { getBrowserClient } from "./supabase";

export const settingsService = {
  async get(key: string) {
    const supabase = getBrowserClient();
    return supabase.from("business_settings").select("*").eq("key", key).single();
  },

  async getAll() {
    const supabase = getBrowserClient();
    return supabase.from("business_settings").select("*");
  },

  async update(key: string, value: Record<string, unknown>) {
    const supabase = getBrowserClient();
    return (
      supabase
        .from("business_settings")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .update({ value: value as any, updated_at: new Date().toISOString() })
        .eq("key", key)
        .select()
        .single()
    );
  },
};
