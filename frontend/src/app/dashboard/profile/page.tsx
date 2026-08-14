import { getCurrentUserDetails } from "@/lib/auth";
import { ProfileView } from "@/components/profile/ProfileView";

export default async function ProfilePage() {
  const { user, profile } = await getCurrentUserDetails();

  return <ProfileView profile={profile} email={user.email ?? ""} />;
}
