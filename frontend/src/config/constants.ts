import type { AppointmentStatus, PaymentStatus, PlanStatus } from "@/types/database";

export const APP_NAME = "Glow By Miral";

export const API_ROUTES = {
  // Appointments
  appointments: "/appointments",
  appointmentById: (id: string) => `/appointments/${id}`,
  appointmentProducts: (id: string) => `/appointments/${id}/products`,
  appointmentProductById: (id: string) => `/appointments/products/${id}`,
  // Clients
  clients: "/clients",
  clientById: (id: string) => `/clients/${id}`,
  clientHistory: (id: string) => `/clients/${id}/history`,
  clientAppointmentCounts: "/clients/appointment-counts",
  // Staff
  staff: "/staff",
  staffById: (id: string) => `/staff/${id}`,
  staffSchedule: (id: string) => `/staff/${id}/schedule`,
  staffLeaves: (id: string) => `/staff/${id}/leaves`,
  staffServices: (id: string) => `/staff/${id}/services`,
  staffServiceById: (id: string, svcId: string) => `/staff/${id}/services/${svcId}`,
  // Services
  services: "/services",
  serviceById: (id: string) => `/services/${id}`,
  serviceVariants: (id: string) => `/services/${id}/variants`,
  serviceVariantById: (id: string) => `/services/variants/${id}`,
  serviceCategories: "/services/categories",
  serviceCategoryById: (id: string) => `/services/categories/${id}`,
  // Products
  products: "/products",
  productById: (id: string) => `/products/${id}`,
  productCategories: "/products/categories",
  productsLowStock: "/products/low-stock",
  // Orders
  orders: "/orders",
  orderById: (id: string) => `/orders/${id}`,
  // Consultation
  consultationTemplates: "/consultation/templates",
  consultationTemplateById: (id: string) => `/consultation/templates/${id}`,
  consultationRecords: "/consultation/records",
  consultationRecordById: (id: string) => `/consultation/records/${id}`,
  // Treatment Plans
  treatmentPlanTemplates: "/treatment-plans/templates",
  treatmentPlanTemplateById: (id: string) => `/treatment-plans/templates/${id}`,
  treatmentPlans: "/treatment-plans",
  treatmentPlanById: (id: string) => `/treatment-plans/${id}`,
  // Reports
  reports: "/reports",
  // Settings
  settings: "/settings",
  // Notifications
  notifications: "/notifications",
  notificationRead: (id: string) => `/notifications/${id}/read`,
  notificationsReadAll: "/notifications/read-all",
  notificationsUnreadCount: "/notifications/unread-count",
  // Chat
  chatConversations: "/chat/conversations",
  chatConversationById: (id: string) => `/chat/conversations/${id}`,
  chatMessages: (id: string) => `/chat/conversations/${id}/messages`,
  chatMarkRead: (id: string) => `/chat/conversations/${id}/read`,
  chatRecipients: "/chat/recipients",
  // Profiles
  profiles: "/profiles",
  profileById: (id: string) => `/profiles/${id}`,
  // Me
  me: "/me",
} as const;

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
