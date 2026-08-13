import type { AppointmentStatus, PaymentStatus, PlanStatus } from "@/types/database";

export const APP_NAME = "Glow By Miral";

export const ROUTES = {
  home: "/",
  login: "/login",
  forgotPassword: "/forgot-password",
  dashboard: "/dashboard",
  appointments: "/dashboard/appointments",
  clients: "/dashboard/clients",
  services: "/dashboard/services",
  consultation: "/dashboard/consultation",
  treatmentPlans: "/dashboard/treatment-plans",
  staff: "/dashboard/staff",
  products: "/dashboard/products",
  chat: "/dashboard/chat",
  reports: "/dashboard/reports",
  settings: "/dashboard/settings",
  profile: "/dashboard/profile",
  aiAssistant: "/dashboard/ai-assistant",
} as const;

export const ROLES = {
  ADMIN: "admin",
  STAFF: "staff",
  CUSTOMER: "customer",
} as const;

export const APPOINTMENT_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No Show",
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  unpaid: "Unpaid",
  partial: "Partial",
  paid: "Paid",
  refunded: "Refunded",
};

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export const PLAN_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  active: "Active",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const ITEMS_PER_PAGE = 20;

export const APPOINTMENT_STATUS_OPTIONS: AppointmentStatus[] = [
  "pending",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
  "no_show",
];

export const PAYMENT_STATUS_OPTIONS: PaymentStatus[] = ["unpaid", "partial", "paid", "refunded"];

export const PLAN_STATUSES: PlanStatus[] = ["draft", "active", "completed", "cancelled"];

export const APPOINTMENT_STATUS_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["in_progress", "cancelled", "no_show"],
  in_progress: ["completed"],
  completed: [],
  cancelled: [],
  no_show: [],
};

export const APPOINTMENT_FILTER_OPTIONS: { value: AppointmentStatus | "all"; label: string }[] = [
  { value: "all", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "no_show", label: "No Show" },
];

export const ROLE_LABELS: Record<string, string> = {
  admin: "Administrator",
  staff: "Staff Member",
  customer: "Customer",
};

export const ROLE_DESCRIPTIONS: Record<string, string> = {
  admin: "Full access to manage the salon, staff, clients, and all settings.",
  staff: "Can manage appointments, clients, consultations, and treatment plans.",
  customer: "Can book appointments, browse products, and view personal records.",
};
