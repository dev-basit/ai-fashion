"use client";

import { useState } from "react";
import { User, Mail, Phone, Calendar, Shield, Pencil, Check, X } from "lucide-react";
import { profilesService } from "@/services/profiles.service";
import { useAuthStore } from "@/store/auth.store";
import { PageHeader } from "@/components/common/PageHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/utils/date";
import { formatInitials } from "@/utils/format";
import { ROLE_LABELS, ROLE_DESCRIPTIONS } from "@/config/constants";
import type { ProfileViewProps } from "@/types/props";
import type { Profile } from "@/types/database";

export function ProfileView({ profile: initialProfile, email }: ProfileViewProps) {
  const [profile, setProfile] = useState<Profile | null>(initialProfile);
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(initialProfile?.full_name ?? "");
  const [phone, setPhone] = useState(initialProfile?.phone ?? "");
  const [saving, setSaving] = useState(false);
  const setStoreProfile = useAuthStore((s) => s.setProfile);

  const save = async () => {
    if (!profile) return;
    setSaving(true);
    const { data } = await profilesService.update(profile.id, {
      full_name: fullName.trim() || null,
      phone: phone.trim() || null,
    });
    if (data) {
      setProfile(data);
      setStoreProfile(data);
    }
    setSaving(false);
    setEditing(false);
  };

  const cancel = () => {
    setFullName(profile?.full_name ?? "");
    setPhone(profile?.phone ?? "");
    setEditing(false);
  };

  if (!profile) return null;

  const role = profile.role;

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="My Profile" description="View and update your personal information" />

      {/* Avatar + name header card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-5">
            <Avatar className="h-20 w-20 text-xl">
              <AvatarImage src={profile.avatar_url ?? undefined} alt={profile.full_name ?? ""} />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-semibold">
                {formatInitials(profile.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold truncate">{profile.full_name ?? "No name set"}</h2>
              <p className="text-sm text-muted-foreground truncate">{email}</p>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="outline" className="capitalize font-medium text-xs">
                  <Shield className="h-3 w-3 mr-1" />
                  {ROLE_LABELS[role] ?? role}
                </Badge>
                {profile.is_active ? (
                  <Badge
                    variant="outline"
                    className="text-xs text-green-700 border-green-300 dark:text-green-400 dark:border-green-700"
                  >
                    Active
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs text-destructive border-destructive/30">
                    Inactive
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Role info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Account Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm capitalize">{ROLE_LABELS[role] ?? role}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{ROLE_DESCRIPTIONS[role]}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal details */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base">Personal Details</CardTitle>
          {!editing && (
            <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
              <Pencil className="h-3.5 w-3.5 mr-1.5" />
              Edit
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {editing ? (
            <>
              <div className="space-y-1.5">
                <Label>Full Name</Label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={save} disabled={saving}>
                  <Check className="h-3.5 w-3.5 mr-1.5" />
                  {saving ? "Saving..." : "Save"}
                </Button>
                <Button size="sm" variant="outline" onClick={cancel} disabled={saving}>
                  <X className="h-3.5 w-3.5 mr-1.5" />
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground w-16">Name</span>
                <span className="font-medium">
                  {profile.full_name ?? <span className="text-muted-foreground italic">Not set</span>}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground w-16">Email</span>
                <span className="font-medium">{email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground w-16">Phone</span>
                <span className="font-medium">
                  {profile.phone ?? <span className="text-muted-foreground italic">Not set</span>}
                </span>
              </div>
              {profile.date_of_birth && (
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground w-16">Birthday</span>
                  <span className="font-medium">{formatDate(profile.date_of_birth)}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground w-16">Joined</span>
                <span className="font-medium">{formatDate(profile.created_at)}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
