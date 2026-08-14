"use client";

import { useState, useMemo } from "react";
import { Plus, Search, Users } from "lucide-react";
import Link from "next/link";
import { useClients, useClientAppointmentCounts } from "@/hooks/useClients";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { PageLoading } from "@/components/common/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ClientForm } from "./ClientForm";
import { formatInitials } from "@/utils/format";
import { formatDate } from "@/utils/date";
import { differenceInDays } from "date-fns";
import type { ClientsViewProps } from "@/types/props";
import type { Profile } from "@/types/database";


type Segment = "all" | "new" | "recurring" | "vip";

const SEGMENTS: { value: Segment; label: string }[] = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "recurring", label: "Recurring" },
  { value: "vip", label: "VIP" },
];

export function ClientsView({ role }: ClientsViewProps) {
  const [search, setSearch] = useState("");
  const [segment, setSegment] = useState<Segment>("all");
  const [showForm, setShowForm] = useState(false);
  const { data: clientsRaw, isLoading } = useClients(search || undefined);
  const clients = (clientsRaw ?? []) as Profile[];
  const { data: countsRaw } = useClientAppointmentCounts();
  const counts = (countsRaw ?? {}) as Record<string, number>;

  const isVip = (notes: string | null) => !!notes && /vip/i.test(notes);

  const filtered = useMemo(() => {
    return clients.filter((c) => {
      if (segment === "new") return differenceInDays(new Date(), new Date(c.created_at)) <= 30;
      if (segment === "recurring") return (counts[c.id] ?? 0) >= 2;
      if (segment === "vip") return isVip(c.notes);
      return true;
    });
  }, [clients, segment, counts]);

  if (isLoading) return <PageLoading />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clients"
        description="Manage your client database"
        action={
          role === "admin" ? (
            <Button size="sm" onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-1" /> Add Client
            </Button>
          ) : undefined
        }
      />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search clients..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {SEGMENTS.map((s) => (
          <button
            key={s.value}
            onClick={() => setSegment(s.value)}
            className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${segment === s.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Users className="h-12 w-12" />}
          title="No clients found"
          description="No clients match your search or filter."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((client) => (
            <Link key={client.id} href={`/dashboard/clients/${client.id}`}>
              <Card className="hover:bg-accent transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={client.avatar_url ?? undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {formatInitials(client.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="font-medium text-sm truncate">{client.full_name ?? "Unnamed"}</p>
                        {isVip(client.notes) && <Badge className="text-[10px] h-4 px-1.5">VIP</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{client.phone ?? "No phone"}</p>
                      <p className="text-xs text-muted-foreground">
                        {counts[client.id] ?? 0} appt{(counts[client.id] ?? 0) === 1 ? "" : "s"} · since{" "}
                        {formatDate(client.created_at, "MMM yyyy")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Client</DialogTitle>
          </DialogHeader>
          <ClientForm
            onSuccess={() => setShowForm(false)}
            onCancel={() => setShowForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
