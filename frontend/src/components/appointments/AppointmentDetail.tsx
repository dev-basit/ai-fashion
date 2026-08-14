"use client";

import { useState } from "react";
import { ArrowLeft, Pencil, Package, Trash2, Plus } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/config/constants";
import {
  useAppointment,
  useAppointmentProducts,
  useUpdateAppointment,
  useUpdateAppointmentStatus,
  useUpdatePaymentStatus,
  useAddAppointmentProduct,
  useRemoveAppointmentProduct,
} from "@/hooks/useAppointments";
import { useProducts, useUpdateProductStock } from "@/hooks/useProducts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AppointmentForm } from "./AppointmentForm";
import { AppointmentStatusBadge, PaymentStatusBadge } from "@/components/common/StatusBadge";
import { PageLoading } from "@/components/common/LoadingSpinner";
import { formatDate, formatTime, formatDuration } from "@/utils/date";
import { formatCurrency } from "@/utils/format";
import { PAYMENT_STATUS_LABELS } from "@/config/constants";
import { APPOINTMENT_STATUS_OPTIONS, PAYMENT_STATUS_OPTIONS } from "@/config/constants";
import type { AppointmentDetailProps } from "@/types/props";
import type { Appointment, AppointmentStatus, PaymentStatus, Product, AppointmentProduct } from "@/types/database";


export function AppointmentDetail({ appointmentId, role }: AppointmentDetailProps) {
  const [showEdit, setShowEdit] = useState(false);
  const [notes, setNotes] = useState<string | null>(null);
  const [internalNotes, setInternalNotes] = useState<string | null>(null);
  const [showProduct, setShowProduct] = useState(false);
  const [prodId, setProdId] = useState("");
  const [prodQty, setProdQty] = useState("1");

  const isStaffOrAdmin = role === "staff" || role === "admin";

  const { data: appointment, isLoading } = useAppointment(appointmentId);
  const { data: productsUsed = [] } = useAppointmentProducts(appointmentId);
  const { data: allProducts } = useProducts();
  const products = (allProducts ?? []) as Product[];

  const updateAppointment = useUpdateAppointment();
  const updateStatus = useUpdateAppointmentStatus();
  const updatePayment = useUpdatePaymentStatus();
  const addProductUsed = useAddAppointmentProduct();
  const removeProductUsed = useRemoveAppointmentProduct();
  const updateStock = useUpdateProductStock();

  if (isLoading || !appointment) return <PageLoading />;

  const apt = appointment as Appointment & {
    services?: { name?: string; duration_mins?: number };
    profiles?: { full_name?: string; phone?: string };
    staff_profiles?: { profiles?: { full_name?: string } };
  };

  const currentNotes = notes !== null ? notes : (apt.notes ?? "");
  const currentInternalNotes = internalNotes !== null ? internalNotes : (apt.internal_notes ?? "");

  const saveNotes = () => {
    updateAppointment.mutate({
      id: appointmentId,
      notes: currentNotes || null,
      internal_notes: currentInternalNotes || null,
    });
  };

  const changeStatus = (status: AppointmentStatus) => {
    updateStatus.mutate({ id: appointmentId, status });
  };

  const changePayment = (payment: PaymentStatus) => {
    updatePayment.mutate({ id: appointmentId, payment_status: payment });
  };

  const addProduct = async () => {
    if (!prodId) return;
    const qty = parseFloat(prodQty) || 1;
    await addProductUsed.mutateAsync({ appointment_id: appointmentId, product_id: prodId, quantity: qty });
    const prod = products.find((p) => p.id === prodId);
    if (prod) updateStock.mutate({ id: prodId, quantity: Math.max(0, prod.stock_quantity - qty) });
    setProdId("");
    setProdQty("1");
    setShowProduct(false);
  };

  const removeProduct = (id: string) => {
    removeProductUsed.mutate({ id, appointmentId });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href={ROUTES.appointments} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold">Appointment</h1>
        </div>
        {(role === "admin" || (role === "customer" && apt.status === "pending")) && (
          <Button size="sm" variant="outline" onClick={() => setShowEdit(true)}>
            <Pencil className="h-4 w-4 mr-1" /> {role === "customer" ? "Reschedule" : "Edit"}
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <AppointmentStatusBadge status={apt.status} />
            <PaymentStatusBadge status={apt.payment_status} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 text-sm">
            <div>
              <span className="text-muted-foreground">Service:</span>{" "}
              <span className="font-medium">{apt.services?.name}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Duration:</span>{" "}
              {apt.services?.duration_mins ? formatDuration(apt.services.duration_mins) : "—"}
            </div>
            <div>
              <span className="text-muted-foreground">Client:</span>{" "}
              <span className="font-medium">{apt.profiles?.full_name}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Staff:</span>{" "}
              {apt.staff_profiles?.profiles?.full_name ?? "Unassigned"}
            </div>
            <div>
              <span className="text-muted-foreground">Date:</span> {formatDate(apt.starts_at)}
            </div>
            <div>
              <span className="text-muted-foreground">Time:</span> {formatTime(apt.starts_at)}
            </div>
            {role !== "staff" && (
              <div>
                <span className="text-muted-foreground">Price:</span>{" "}
                <span className="font-medium">{formatCurrency(apt.price)}</span>
              </div>
            )}
          </div>

          {isStaffOrAdmin && (
            <div className="flex flex-wrap gap-3 pt-2 border-t border-border">
              <div className="space-y-1">
                <Label className="text-xs">Status</Label>
                <Select
                  value={apt.status}
                  items={Object.fromEntries(APPOINTMENT_STATUS_OPTIONS.map((s) => [s, s.replace(/_/g, " ")]))}
                  onValueChange={(v: unknown) => changeStatus(String(v) as AppointmentStatus)}
                >
                  <SelectTrigger className="w-40 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {APPOINTMENT_STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {role === "admin" && (
                <div className="space-y-1">
                  <Label className="text-xs">Payment</Label>
                  <Select
                    value={apt.payment_status}
                    items={Object.fromEntries(PAYMENT_STATUS_OPTIONS.map((s) => [s, PAYMENT_STATUS_LABELS[s]]))}
                    onValueChange={(v: unknown) => changePayment(String(v) as PaymentStatus)}
                  >
                    <SelectTrigger className="w-40 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {PAYMENT_STATUS_LABELS[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isStaffOrAdmin ? (
            <>
              <div className="space-y-1.5">
                <Label className="text-xs">Client-visible notes</Label>
                <Textarea rows={2} value={currentNotes} onChange={(e) => setNotes(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Internal / treatment notes</Label>
                <Textarea
                  rows={3}
                  value={currentInternalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Treatment performed, observations..."
                />
              </div>
              <Button size="sm" onClick={saveNotes} disabled={updateAppointment.isPending}>
                {updateAppointment.isPending ? "Saving..." : "Save Notes"}
              </Button>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">{apt.notes || "No notes."}</p>
          )}
        </CardContent>
      </Card>

      {/* Products used (staff/admin) */}
      {isStaffOrAdmin && (
        <Card>
          <CardHeader className="pb-3 flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">Products Used</CardTitle>
            <Button size="sm" variant="outline" onClick={() => setShowProduct(true)}>
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </CardHeader>
          <CardContent>
            {(productsUsed as AppointmentProduct[]).length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">No products recorded.</p>
            ) : (
              <div className="space-y-2">
                {(productsUsed as AppointmentProduct[]).map((pu) => (
                  <div
                    key={pu.id}
                    className="flex items-center justify-between rounded-md border border-border p-2.5 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {(pu as AppointmentProduct & { products?: { name?: string } }).products?.name ?? "Product"}
                      </span>
                      <span className="text-muted-foreground">×{pu.quantity}</span>
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => removeProduct(pu.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit / reschedule */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{role === "customer" ? "Reschedule Appointment" : "Edit Appointment"}</DialogTitle>
          </DialogHeader>
          <AppointmentForm
            userRole={role}
            appointment={apt as Appointment}
            clientId={role === "customer" ? apt.client_id : undefined}
            onSuccess={() => setShowEdit(false)}
            onCancel={() => setShowEdit(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Add product used */}
      <Dialog open={showProduct} onOpenChange={setShowProduct}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Product Used</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Product</Label>
              <Select onValueChange={(v: unknown) => setProdId(String(v ?? ""))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} ({p.stock_quantity} in stock)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Quantity</Label>
              <Input
                type="number"
                min="0"
                step="0.1"
                value={prodQty}
                onChange={(e) => setProdQty(e.target.value)}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowProduct(false)}>
                Cancel
              </Button>
              <Button onClick={addProduct} disabled={!prodId || addProductUsed.isPending}>
                Add
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
