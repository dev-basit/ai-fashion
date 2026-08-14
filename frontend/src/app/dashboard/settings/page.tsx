import { getCurrentUserDetails } from "@/lib/auth";
import { SettingsView } from "@/components/settings/SettingsView";

export default async function SettingsPage() {
  const { profile } = await getCurrentUserDetails();

  return <SettingsView profile={profile} />;
}
