"use client";

import { Menu, Bell, LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/store/ui.store";
import { ROUTES } from "@/config/constants";
import { useAuthStore } from "@/store/auth.store";
import { useNotifications } from "@/hooks/useNotifications";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatInitials } from "@/utils/format";
import { formatRelativeDate } from "@/utils/date";
import type { HeaderProps } from "@/types/props";


export function Header({ profile: serverProfile }: HeaderProps) {
  const { toggleSidebar } = useUIStore();
  const signOut = useAuthStore((s) => s.signOut);
  const storeProfile = useAuthStore((s) => s.profile);
  const router = useRouter();
  const { notifications, unreadCount, markAsRead } = useNotifications();

  // prefer server-passed profile, fall back to client store
  const profile = serverProfile ?? storeProfile;

  const handleSignOut = async () => {
    await signOut();
    router.push(ROUTES.login);
  };

  return (
    <header className="flex h-16 items-center gap-4 border-b border-border bg-background px-4 md:px-6">
      <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleSidebar}>
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        {profile && (
          <div className="text-right leading-tight hidden sm:block">
            <p className="text-sm font-semibold uppercase tracking-wide">{profile.full_name ?? "User"}</p>
            {profile.role !== "admin" && (
              <p className="text-xs text-muted-foreground capitalize">{profile.role}</p>
            )}
          </div>
        )}
        <ThemeToggle />

        {/* Notifications */}
        <Popover>
          <PopoverTrigger className="relative inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold text-sm">Notifications</h3>
              {unreadCount > 0 && <span className="text-xs text-muted-foreground">{unreadCount} unread</span>}
            </div>
            <div className="max-h-64 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No notifications</p>
              ) : (
                notifications.slice(0, 8).map((n) => (
                  <button
                    key={n.id}
                    className={`w-full text-left p-4 hover:bg-accent transition-colors border-b border-border/50 last:border-0 ${!n.is_read ? "bg-primary/5" : ""}`}
                    onClick={() => markAsRead(n.id)}
                  >
                    <p className="text-sm font-medium">{n.title}</p>
                    {n.body && <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>}
                    <p className="text-xs text-muted-foreground mt-1">{formatRelativeDate(n.created_at)}</p>
                  </button>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile?.avatar_url ?? undefined} alt={profile?.full_name ?? ""} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {formatInitials(profile?.full_name)}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => router.push(ROUTES.profile)}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
