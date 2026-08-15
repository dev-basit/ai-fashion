"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/config/constants";
import { ArrowLeft, Pencil, UserX } from "lucide-react";
import Link from "next/link";
import { useSetAvailability, useDeactivateStaffProfile } from "@/hooks/useStaff";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { StaffForm } from "./StaffForm";
import { StaffScheduleGrid } from "./StaffScheduleGrid";
import { StaffLeaveCalendar } from "./StaffLeaveCalendar";
import { StaffServiceAssignment } from "./StaffServiceAssignment";
import { formatInitials, formatCurrency } from "@/utils/format";
import { formatDate } from "@/utils/date";
import type { StaffProfileViewProps } from "@/types/props";

export function StaffProfileView({ staffProfile, isOwnProfile, role }: StaffProfileViewProps) {
  const router = useRouter();
  const profile = staffProfile.profiles;
  const isAdmin = role === "admin";
  const canManage = isAdmin || isOwnProfile;
  const isProvider = role === "customer"; // customers see read-only provider profile

  const [available, setAvailable] = useState(staffProfile.is_available);
  const [showEdit, setShowEdit] = useState(false);
  const [showRemove, setShowRemove] = useState(false);
  const setAvailability = useSetAvailability();
  const deactivateProfile = useDeactivateStaffProfile();

  const toggleAvailability = (val: boolean) => {
    setAvailable(val);
    setAvailability.mutate({ id: staffProfile.id, isAvailable: val });
  };

  const remove = () => {
    deactivateProfile.mutate(staffProfile.profile_id, {
      onSuccess: () => {
        setShowRemove(false);
        router.push(ROUTES.staff);
        router.refresh();
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href={ROUTES.staff} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold">Staff Profile</h1>
        </div>
        {canManage && (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setShowEdit(true)}>
              <Pencil className="h-4 w-4 mr-1" /> Edit
            </Button>
            {isAdmin && (
              <Button size="sm" variant="destructive" onClick={() => setShowRemove(true)}>
                <UserX className="h-4 w-4 mr-1" /> Remove
              </Button>
            )}
          </div>
        )}
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile?.avatar_url ?? undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-lg">
                  {formatInitials(profile?.full_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold">{profile?.full_name ?? "Staff Member"}</h2>
                {!isProvider && <p className="text-muted-foreground text-sm">{profile?.phone}</p>}
                <Badge variant={available ? "default" : "secondary"} className="mt-1">
                  {available ? "Available" : "Unavailable"}
                </Badge>
              </div>
            </div>
            {canManage && (
              <div className="flex items-center gap-2">
                <Label htmlFor="avail" className="text-xs">
                  Available
                </Label>
                <Switch id="avail" checked={available} onCheckedChange={toggleAvailability} />
              </div>
            )}
          </div>
          {staffProfile.bio && <p className="text-sm text-muted-foreground mt-4">{staffProfile.bio}</p>}
          {staffProfile.specializations && staffProfile.specializations.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {staffProfile.specializations.map((s, i) => (
                <span key={i} className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                  {s}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {isProvider ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Services Offered</CardTitle>
          </CardHeader>
          <CardContent>
            <StaffServiceAssignment staffProfileId={staffProfile.id} editable={false} />
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="schedule">
          <TabsList>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="leave">Leave</TabsTrigger>
            {isAdmin && <TabsTrigger value="employment">Employment</TabsTrigger>}
          </TabsList>

          <TabsContent value="schedule" className="mt-4">
            <Card>
              <CardContent className="p-5">
                <StaffScheduleGrid staffProfileId={staffProfile.id} editable={canManage} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="mt-4">
            <Card>
              <CardContent className="p-5">
                <StaffServiceAssignment staffProfileId={staffProfile.id} editable={isAdmin} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leave" className="mt-4">
            <Card>
              <CardContent className="p-5">
                <StaffLeaveCalendar staffProfileId={staffProfile.id} editable={canManage} />
              </CardContent>
            </Card>
          </TabsContent>

          {isAdmin && (
            <TabsContent value="employment" className="mt-4">
              <Card>
                <CardContent className="p-5 space-y-1 text-sm text-muted-foreground">
                  {staffProfile.hire_date && <p>Hired: {formatDate(staffProfile.hire_date)}</p>}
                  {staffProfile.hourly_rate != null && <p>Rate: {formatCurrency(staffProfile.hourly_rate)}/hr</p>}
                  {staffProfile.commission_rate != null && <p>Commission: {staffProfile.commission_rate}%</p>}
                  {!staffProfile.hire_date && staffProfile.hourly_rate == null && (
                    <p>No employment details recorded.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      )}

      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Staff Profile</DialogTitle>
          </DialogHeader>
          <StaffForm
            staff={staffProfile}
            onSuccess={() => {
              setShowEdit(false);
              router.refresh();
            }}
            onCancel={() => setShowEdit(false)}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={showRemove}
        onOpenChange={setShowRemove}
        title="Remove staff member?"
        description="Their account will be deactivated and they will no longer appear in the active staff list."
        confirmLabel="Remove"
        destructive
        loading={deactivateProfile.isPending}
        onConfirm={remove}
      />
    </div>
  );
}
