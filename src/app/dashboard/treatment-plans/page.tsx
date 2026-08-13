import { getCurrentUserDetails } from "@/lib/auth";
import { TreatmentPlansView } from "@/components/treatment-plans/TreatmentPlansView";

export default async function TreatmentPlansPage() {
  const { user, profile } = await getCurrentUserDetails();

  return <TreatmentPlansView role={profile?.role ?? "customer"} userId={user.id} />;
}
