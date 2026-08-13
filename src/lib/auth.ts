import { redirect } from "next/navigation";
import { ROUTES } from "@/config/constants";
import { getServerClient } from "@/services/supabase-server";

export async function getCurrentUserDetails() {
  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(ROUTES.login);
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  return { user, profile, supabase };
}
