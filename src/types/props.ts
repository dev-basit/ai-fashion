import type { ReactNode, ElementType } from "react";
import type { LucideIcon } from "lucide-react";
import type {
  Profile,
  Appointment,
  Service,
  ServiceCategory,
  StaffProfile,
  UserRole,
  TreatmentPlanTemplate,
  Product,
  ConsultationFormTemplate,
} from "@/types/database";
import type { DatePreset } from "@/components/dashboard/DateRangeFilter";
import type { DateRange } from "@/services/reports.service";

// === Appointments ===
export type AppointmentCalendarProps = {
  appointments: Appointment[];
};

export type AppointmentDetailProps = {
  appointmentId: string;
  role: UserRole;
};

export type AppointmentListProps = {
  appointments: Appointment[];
  isLoading: boolean;
  role: UserRole;
  onRefresh: () => void;
};

export type AppointmentsViewProps = {
  role: UserRole;
  userId: string;
  staffProfileId?: string;
};

export type AppointmentFormProps = {
  userRole: UserRole;
  clientId?: string;
  appointment?: Appointment;
  onSuccess: () => void;
  onCancel: () => void;
};

// === Chat ===
export type ChatViewProps = {
  userId: string;
  userRole: UserRole;
};

export type NewConversationDialogProps = {
  userId: string;
  userRole: UserRole;
  onCreated: (conversationId: string) => void;
  onCancel: () => void;
};

// === Clients ===
export type ClientFormProps = {
  client?: Profile;
  onSuccess: () => void;
  onCancel: () => void;
};

export type ClientProfileViewProps = {
  client: Profile;
  role: UserRole;
  staffProfileId?: string;
};

export type ClientsViewProps = {
  role: UserRole;
};

// === Consultation ===
export type ConsultationViewProps = {
  role: UserRole;
  userId: string;
  staffProfileId?: string;
};

export type ConsultationFormProps = {
  template: ConsultationFormTemplate;
  clientId?: string;
  staffProfileId?: string | null;
  onSuccess: () => void;
  onCancel: () => void;
};

export type ConsultationRecordViewProps = {
  recordId: string;
  role: UserRole;
};

export type ConsultationTemplateBuilderProps = {
  template?: ConsultationFormTemplate;
  onSuccess: () => void;
  onCancel: () => void;
};

// === Dashboard ===
export type StatsCardProps = {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: { value: number; label: string };
  className?: string;
};

export type HeaderProps = {
  profile: Profile | null;
};

export type NavItem = {
  href: string;
  icon: ElementType;
  label: string;
  roles: UserRole[];
};

export type SidebarProps = {
  role: UserRole;
};

export type DateRangeFilterProps = {
  preset: DatePreset;
  onChange: (preset: DatePreset, range: DateRange) => void;
};

// === Products ===
export type ProductsViewProps = {
  role: UserRole;
  userId: string;
};

export type ProductFormProps = {
  product?: Product;
  onSuccess: () => void;
  onCancel: () => void;
};

export type ProductDetailViewProps = {
  product: Product;
  role: UserRole;
};

export type ProductInventoryProps = {
  products: Product[];
  onRefetch: () => void;
};

export type CartSheetProps = {
  onCheckout: () => void;
};

export type CheckoutProps = {
  userId: string;
  onDone: () => void;
};

export type OrderListProps = {
  role: UserRole;
  userId: string;
};

// === Profile ===
export type ProfileViewProps = {
  profile: Profile | null;
  email: string;
};

// === Reports ===
export type ReportsViewProps = {
  role: UserRole;
  userId: string;
};

export type StaffPerf = {
  name: string;
  appointments: number;
  revenue: number;
};

// === Services ===
export type ServicesViewProps = {
  role: UserRole;
};

export type ServiceFormProps = {
  service?: Service;
  categories: ServiceCategory[];
  onSuccess: () => void;
  onCancel: () => void;
};

export type ServiceVariantManagerProps = {
  serviceId: string;
};

// === Settings ===
export type SettingsViewProps = {
  profile: Profile | null;
};

// === Staff ===
export type StaffFormProps = {
  staff?: StaffProfile & { profiles?: Profile };
  onSuccess: () => void;
  onCancel: () => void;
};

export type StaffProfileViewProps = {
  staffProfile: StaffProfile & { profiles?: Profile };
  isOwnProfile: boolean;
  role: UserRole;
};

export type StaffScheduleGridProps = {
  staffProfileId: string;
  editable?: boolean;
};

export type StaffScheduleRow = {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_working: boolean;
};

export type StaffLeaveCalendarProps = {
  staffProfileId: string;
  editable?: boolean;
};

export type StaffServiceAssignmentProps = {
  staffProfileId: string;
  editable?: boolean;
};

// === Treatment Plans ===
export type TreatmentPlansViewProps = {
  role: UserRole;
  userId: string;
};

export type TreatmentPlanProgressProps = {
  planId: string;
  role: UserRole;
};

export type TreatmentPlanTemplateBuilderProps = {
  template?: TreatmentPlanTemplate;
  onSuccess: () => void;
  onCancel: () => void;
};

export type TreatmentPlanAssignProps = {
  assignedBy: string;
  onSuccess: () => void;
  onCancel: () => void;
};

// === Common ===
export type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  destructive?: boolean;
  loading?: boolean;
};

export type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export type PageHeaderProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export type RoleGuardProps = {
  roles: UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
};

// === UI ===
export type DatePickerProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
};

export type DateTimePickerProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
};

// AI Assistant
export type AIChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  isError?: boolean;
};
