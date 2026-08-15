export type UserRole = "admin" | "staff" | "customer";
export type AppointmentStatus = "pending" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show";
export type PaymentStatus = "unpaid" | "partial" | "paid" | "refunded";
export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
export type MessageType = "text" | "image" | "file" | "system";
export type PlanStatus = "draft" | "active" | "completed" | "cancelled";
export type NotificationType = "appointment" | "message" | "order" | "system" | "reminder";
export type ClientSegment = "all" | "new" | "recurring" | "vip";
export type DatePreset = "today" | "7d" | "30d" | "custom";

export type Profile = {
  id: string;
  role: UserRole;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  date_of_birth: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type StaffProfile = {
  id: string;
  profile_id: string;
  bio: string | null;
  specializations: string[] | null;
  certifications: string[] | null;
  hire_date: string | null;
  hourly_rate: number | null;
  commission_rate: number | null;
  is_available: boolean;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
};

export type ServiceCategory = {
  id: string;
  parent_id: string | null;
  name: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  children?: ServiceCategory[];
};

export type Service = {
  id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  base_price: number;
  duration_mins: number;
  image_url: string | null;
  instructions: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  service_categories?: ServiceCategory;
  service_variants?: ServiceVariant[];
};

export type ServiceVariant = {
  id: string;
  service_id: string;
  name: string;
  price_modifier: number;
  duration_modifier: number;
  is_active: boolean;
  created_at: string;
};

export type Appointment = {
  id: string;
  client_id: string;
  staff_profile_id: string | null;
  service_id: string;
  service_variant_id: string | null;
  starts_at: string;
  ends_at: string;
  status: AppointmentStatus;
  payment_status: PaymentStatus;
  price: number;
  discount: number;
  notes: string | null;
  internal_notes: string | null;
  consultation_record_id: string | null;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
  services?: Service;
  staff_profiles?: StaffProfile & { profiles?: Profile };
};

export type ConsultationFormTemplate = {
  id: string;
  name: string;
  description: string | null;
  fields: ConsultationField[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ConsultationField = {
  id: string;
  label: string;
  type: "text" | "textarea" | "select" | "radio" | "checkbox" | "date";
  required: boolean;
  options?: string[];
  placeholder?: string;
};

export type ConsultationRecord = {
  id: string;
  template_id: string | null;
  client_id: string;
  staff_profile_id: string | null;
  appointment_id: string | null;
  responses: Record<string, unknown>;
  observations: string | null;
  recommendations: string[] | null;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
  staff_profiles?: StaffProfile & { profiles?: Profile };
  consultation_form_templates?: ConsultationFormTemplate;
};

export type TreatmentPlanTemplate = {
  id: string;
  name: string;
  description: string | null;
  duration_days: number;
  steps: TreatmentPlanStep[];
  created_by: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type TreatmentPlanStep = {
  day: number;
  title: string;
  description: string;
  service_id?: string;
  recommended_products?: string[];
};

export type ClientTreatmentPlan = {
  id: string;
  template_id: string | null;
  client_id: string;
  assigned_by: string | null;
  name: string;
  starts_on: string;
  ends_on: string | null;
  status: PlanStatus;
  progress_notes: TreatmentProgressNote[];
  created_at: string;
  updated_at: string;
  profiles?: Profile;
  treatment_plan_templates?: TreatmentPlanTemplate;
};

export type TreatmentProgressNote = {
  date: string;
  note: string;
  step_index?: number;
};

export type ProductCategory = {
  id: string;
  parent_id: string | null;
  name: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  children?: ProductCategory[];
};

export type Product = {
  id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  sku: string | null;
  price: number;
  cost_price: number | null;
  stock_quantity: number;
  low_stock_threshold: number;
  image_url: string | null;
  is_active: boolean;
  is_for_sale: boolean;
  created_at: string;
  updated_at: string;
  product_categories?: ProductCategory;
};

export type Order = {
  id: string;
  client_id: string;
  status: OrderStatus;
  total_amount: number;
  shipping_address: Record<string, string> | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
  order_items?: OrderItem[];
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  created_at: string;
  products?: Product;
};

export type AppointmentProduct = {
  id: string;
  appointment_id: string;
  product_id: string;
  quantity: number;
  notes: string | null;
  created_at: string;
  products?: Product;
};

export type Conversation = {
  id: string;
  title: string | null;
  is_group: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  conversation_participants?: ConversationParticipant[];
  messages?: Message[];
  last_message?: Message;
  unread_count?: number;
};

export type ConversationParticipant = {
  conversation_id: string;
  profile_id: string;
  joined_at: string;
  last_read_at: string | null;
  profiles?: Profile;
};

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: MessageType;
  metadata: Record<string, unknown> | null;
  is_edited: boolean;
  edited_at: string | null;
  created_at: string;
  profiles?: Profile;
};

export type StaffSchedule = {
  id: string;
  staff_profile_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_working: boolean;
  created_at: string;
  updated_at: string;
};

export type StaffLeave = {
  id: string;
  staff_profile_id: string;
  starts_at: string;
  ends_at: string;
  reason: string | null;
  approved_by: string | null;
  created_at: string;
};

export type Notification = {
  id: string;
  profile_id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  data: Record<string, unknown> | null;
  is_read: boolean;
  created_at: string;
};

export type BusinessSetting = {
  id: string;
  key: string;
  value: Record<string, unknown>;
  updated_by: string | null;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: { Row: Profile };
      staff_profiles: { Row: StaffProfile };
      service_categories: { Row: ServiceCategory };
      services: { Row: Service };
      service_variants: { Row: ServiceVariant };
      appointments: { Row: Appointment };
      consultation_form_templates: { Row: ConsultationFormTemplate };
      consultation_records: { Row: ConsultationRecord };
      treatment_plan_templates: { Row: TreatmentPlanTemplate };
      client_treatment_plans: { Row: ClientTreatmentPlan };
      product_categories: { Row: ProductCategory };
      products: { Row: Product };
      orders: { Row: Order };
      order_items: { Row: OrderItem };
      conversations: { Row: Conversation };
      conversation_participants: { Row: ConversationParticipant };
      messages: { Row: Message };
      staff_schedules: { Row: StaffSchedule };
      staff_leaves: { Row: StaffLeave };
      notifications: { Row: Notification };
      business_settings: { Row: BusinessSetting };
      ai_conversations: { Row: AiConversation };
      ai_messages: { Row: AiMessage };
    };
  };
};

export type AiConversation = {
  id: string;
  user_id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
};

export type AiMessage = {
  id: string;
  ai_conversation_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};
