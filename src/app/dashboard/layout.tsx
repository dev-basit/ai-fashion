import { getCurrentUserDetails } from "@/lib/auth";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import type { UserRole } from "@/types/database";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await getCurrentUserDetails();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar role={(profile?.role as UserRole) ?? "customer"} />
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Header profile={profile} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
