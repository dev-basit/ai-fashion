"use client";

import { useState } from "react";
import { Plus, UserCog } from "lucide-react";
import Link from "next/link";
import { useStaff } from "@/hooks/useStaff";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { PageLoading } from "@/components/common/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StaffForm } from "./StaffForm";
import { formatInitials } from "@/utils/format";
import type { StaffProfile } from "@/types/database";

export function StaffView() {
  const { data: staffRaw, isLoading } = useStaff();
  const staff = (staffRaw ?? []) as StaffProfile[];
  const [showForm, setShowForm] = useState(false);

  if (isLoading) return <PageLoading />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff"
        description="Manage your team members"
        action={
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-1" /> Add Staff
          </Button>
        }
      />

      {staff.length === 0 ? (
        <EmptyState
          icon={<UserCog className="h-12 w-12" />}
          title="No staff members"
          description="Add staff members to get started."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {staff.map((member) => {
            const extMember = member as StaffProfile & {
              profiles?: { full_name?: string; avatar_url?: string | null; is_active?: boolean };
            };
            return (
              <Link key={member.id} href={`/dashboard/staff/${member.id}`}>
                <Card className="hover:bg-accent transition-colors cursor-pointer">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={extMember.profiles?.avatar_url ?? undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {formatInitials(extMember.profiles?.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {extMember.profiles?.full_name ?? "Staff Member"}
                        </p>
                        {member.specializations && member.specializations.length > 0 && (
                          <p className="text-xs text-muted-foreground truncate">
                            {member.specializations.slice(0, 2).join(", ")}
                          </p>
                        )}
                        <div className="flex items-center gap-1.5 mt-1">
                          <Badge
                            variant={member.is_available ? "default" : "secondary"}
                            className="text-[10px] h-4 px-1.5"
                          >
                            {member.is_available ? "Available" : "Unavailable"}
                          </Badge>
                          {!extMember.profiles?.is_active && (
                            <Badge variant="destructive" className="text-[10px] h-4 px-1.5">
                              Inactive
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Staff Member</DialogTitle>
          </DialogHeader>
          <StaffForm
            onSuccess={() => setShowForm(false)}
            onCancel={() => setShowForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
