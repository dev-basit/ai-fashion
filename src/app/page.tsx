import { getServerClient } from "@/services/supabase-server";
import { LandingPage } from "@/components/landing/LandingPage";

export default async function Home() {
  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <LandingPage isLoggedIn={!!user} />;
}
