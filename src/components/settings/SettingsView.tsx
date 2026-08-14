"use client";

import { useState, useEffect, useCallback } from "react";
import { settingsService } from "@/services/settings.service";
import { getBrowserClient } from "@/services/supabase";
import { PageHeader } from "@/components/common/PageHeader";
import { PageLoading } from "@/components/common/LoadingSpinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { StaffScheduleGrid } from "@/components/staff/StaffScheduleGrid";
import type { SettingsViewProps } from "@/types/props";
import type { Profile, UserRole } from "@/types/database";


function UsersTab() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const load = useCallback(async () => {
    const supabase = getBrowserClient();
    const { data } = await supabase.from("profiles").select("*").eq("is_active", true).order("full_name");
    setUsers((data as Profile[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const changeRole = async (userId: string, role: UserRole) => {
    setSaving(userId);
    const supabase = getBrowserClient();
    await supabase.from("profiles").update({ role }).eq("id", userId);
    setSaving(null);
    load();
  };

  const deactivate = async (userId: string) => {
    const supabase = getBrowserClient();
    await supabase.from("profiles").update({ is_active: false }).eq("id", userId);
    load();
  };

  if (loading) return <PageLoading />;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Users & Roles</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-border">
          {users.map((u) => (
            <div key={u.id} className="flex items-center justify-between py-3 gap-3">
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{u.full_name ?? "Unknown"}</p>
                <p className="text-xs text-muted-foreground">{u.phone ?? "—"}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Select
                  value={u.role}
                  items={{ admin: "Admin", staff: "Staff", customer: "Customer" }}
                  onValueChange={(v: unknown) => changeRole(u.id, String(v) as UserRole)}
                >
                  <SelectTrigger className="h-8 w-28 text-xs" disabled={saving === u.id}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="customer">Customer</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive text-xs h-8"
                  onClick={() => deactivate(u.id)}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function NotificationsTab() {
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [reminderHours, setReminderHours] = useState("24");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await settingsService.get("notification_settings");
        if (data?.value) {
          const v = data.value as { email?: boolean; sms?: boolean; reminder_hours?: number };
          if (v.email !== undefined) setEmailEnabled(v.email);
          if (v.sms !== undefined) setSmsEnabled(v.sms);
          if (v.reminder_hours !== undefined) setReminderHours(String(v.reminder_hours));
        }
      } catch { /* ignore */ }
    };
    load();
  }, []);

  const save = async () => {
    setSaving(true);
    await settingsService.update("notification_settings", {
      email: emailEnabled,
      sms: smsEnabled,
      reminder_hours: Number(reminderHours),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setSaving(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Notification Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-sm">Email Notifications</p>
            <p className="text-xs text-muted-foreground">Send appointment reminders via email</p>
          </div>
          <Switch checked={emailEnabled} onCheckedChange={setEmailEnabled} />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-sm">SMS Notifications</p>
            <p className="text-xs text-muted-foreground">Send appointment reminders via SMS</p>
          </div>
          <Switch checked={smsEnabled} onCheckedChange={setSmsEnabled} />
        </div>
        <div className="space-y-1.5">
          <Label>Reminder (hours before appointment)</Label>
          <Input
            type="number"
            min="1"
            max="72"
            value={reminderHours}
            onChange={(e) => setReminderHours(e.target.value)}
            className="w-24"
          />
        </div>
        <Button onClick={save} disabled={saving}>
          {saving ? "Saving..." : saved ? "Saved!" : "Save"}
        </Button>
      </CardContent>
    </Card>
  );
}

function WorkingHoursTab() {
  const [opening, setOpening] = useState("09:00");
  const [closing, setClosing] = useState("18:00");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await settingsService.get("working_hours");
        if (data?.value) {
          const v = data.value as { opening?: string; closing?: string };
          if (v.opening) setOpening(v.opening);
          if (v.closing) setClosing(v.closing);
        }
      } catch { /* ignore */ }
    };
    load();
  }, []);

  const save = async () => {
    setSaving(true);
    await settingsService.update("working_hours", { opening, closing });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setSaving(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Working Hours</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Opening Time</Label>
            <Input type="time" value={opening} onChange={(e) => setOpening(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Closing Time</Label>
            <Input type="time" value={closing} onChange={(e) => setClosing(e.target.value)} />
          </div>
        </div>
        <Button onClick={save} disabled={saving}>
          {saving ? "Saving..." : saved ? "Saved!" : "Save"}
        </Button>
      </CardContent>
    </Card>
  );
}

function StaffScheduleTab({ profileId }: { profileId: string }) {
  const [staffProfileId, setStaffProfileId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const supabase = getBrowserClient();
        const { data } = await supabase.from("staff_profiles").select("id").eq("profile_id", profileId).single();
        if (data) setStaffProfileId(data.id);
      } catch { /* ignore */ }
    };
    load();
  }, [profileId]);

  if (!staffProfileId) return <PageLoading />;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">My Availability Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        <StaffScheduleGrid staffProfileId={staffProfileId} editable />
      </CardContent>
    </Card>
  );
}

export function SettingsView({ profile }: SettingsViewProps) {
  const [businessName, setBusinessName] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await settingsService.get("business_profile");
        if (data) {
          const val = data.value as { name?: string; phone?: string; email?: string };
          setBusinessName(val.name ?? "");
          setBusinessPhone(val.phone ?? "");
          setBusinessEmail(val.email ?? "");
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const saveBusinessProfile = async () => {
    setSaving(true);
    await settingsService.update("business_profile", {
      name: businessName,
      phone: businessPhone,
      email: businessEmail,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setSaving(false);
  };

  const saveProfile = async () => {
    if (!profile) return;
    setSavingProfile(true);
    const supabase = getBrowserClient();
    await supabase.from("profiles").update({ full_name: fullName, phone }).eq("id", profile.id);
    setSavingProfile(false);
  };

  if (loading) return <PageLoading />;

  const isAdmin = profile?.role === "admin";
  const isStaff = profile?.role === "staff";

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Configure your account and business settings" />

      <Tabs defaultValue={isAdmin ? "business" : "profile"}>
        <TabsList className="flex-wrap h-auto gap-1">
          {isAdmin && <TabsTrigger value="business">Business</TabsTrigger>}
          {isAdmin && <TabsTrigger value="users">Users</TabsTrigger>}
          {isAdmin && <TabsTrigger value="notifications">Notifications</TabsTrigger>}
          {isAdmin && <TabsTrigger value="hours">Working Hours</TabsTrigger>}
          {isStaff && <TabsTrigger value="schedule">My Schedule</TabsTrigger>}
          <TabsTrigger value="profile">My Profile</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>

        {isAdmin && (
          <TabsContent value="business" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Business Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Business Name</Label>
                  <Input
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Glow By Miral"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Phone</Label>
                  <Input
                    value={businessPhone}
                    onChange={(e) => setBusinessPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={businessEmail}
                    onChange={(e) => setBusinessEmail(e.target.value)}
                    placeholder="contact@salon.com"
                  />
                </div>
                <Button onClick={saveBusinessProfile} disabled={saving}>
                  {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {isAdmin && (
          <TabsContent value="users" className="mt-4">
            <UsersTab />
          </TabsContent>
        )}

        {isAdmin && (
          <TabsContent value="notifications" className="mt-4">
            <NotificationsTab />
          </TabsContent>
        )}

        {isAdmin && (
          <TabsContent value="hours" className="mt-4">
            <WorkingHoursTab />
          </TabsContent>
        )}

        {isStaff && profile && (
          <TabsContent value="schedule" className="mt-4">
            <StaffScheduleTab profileId={profile.id} />
          </TabsContent>
        )}

        <TabsContent value="profile" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Full Name</Label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" />
              </div>
              <Button onClick={saveProfile} disabled={savingProfile}>
                {savingProfile ? "Saving..." : "Save Profile"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Appearance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Theme</p>
                  <p className="text-xs text-muted-foreground">Toggle between light and dark mode</p>
                </div>
                <ThemeToggle />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
