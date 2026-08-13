"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Scissors,
  ClipboardList,
  FileText,
  UserCog,
  ShoppingBag,
  MessageSquare,
  BarChart2,
  Settings,
  X,
  Bot,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/ui.store";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LogoSidebar } from "@/components/common/Logo";
import { ROUTES } from "@/config/constants";
import type { NavItem, SidebarProps } from "@/types/props";

const NAV_ITEMS: NavItem[] = [
  { href: ROUTES.dashboard, icon: LayoutDashboard, label: "Dashboard", roles: ["admin", "staff", "customer"] },
  { href: ROUTES.appointments, icon: Calendar, label: "Appointments", roles: ["admin", "staff", "customer"] },
  { href: ROUTES.services, icon: Scissors, label: "Services", roles: ["admin", "staff"] },
  { href: ROUTES.consultation, icon: ClipboardList, label: "Consultation", roles: ["admin", "staff", "customer"] },
  { href: ROUTES.treatmentPlans, icon: FileText, label: "Treatment Plans", roles: ["admin", "staff", "customer"] },
  { href: ROUTES.clients, icon: Users, label: "Clients", roles: ["admin", "staff"] },
  { href: ROUTES.staff, icon: UserCog, label: "Staff", roles: ["admin"] },
  { href: ROUTES.products, icon: ShoppingBag, label: "Products", roles: ["admin", "staff", "customer"] },
  { href: ROUTES.chat, icon: MessageSquare, label: "Chat", roles: ["admin", "staff", "customer"] },
  { href: ROUTES.reports, icon: BarChart2, label: "Reports", roles: ["admin"] },
  { href: ROUTES.settings, icon: Settings, label: "Settings", roles: ["admin"] },
  { href: ROUTES.aiAssistant, icon: Bot, label: "AI Assistant", roles: ["admin", "staff", "customer"] },
];

function SidebarContent({ role }: SidebarProps) {
  const pathname = usePathname();
  const { setSidebarOpen } = useUIStore();
  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between px-4 border-b border-border">
        <Link href={ROUTES.home}>
          <LogoSidebar />
        </Link>
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(false)}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-1 px-2">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === ROUTES.dashboard ? pathname === ROUTES.dashboard : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
    </div>
  );
}

export function Sidebar({ role }: SidebarProps) {
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform bg-sidebar border-r border-sidebar-border transition-transform duration-200 md:hidden",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <SidebarContent role={role} />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:flex-shrink-0 bg-sidebar border-r border-sidebar-border">
        <SidebarContent role={role} />
      </aside>
    </>
  );
}
