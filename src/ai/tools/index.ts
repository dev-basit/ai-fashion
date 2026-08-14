import type { StructuredToolInterface } from "@langchain/core/tools";
import { myProfileTools } from "./my-profile.tools";
import { customerAppointmentTools, staffAppointmentTools, adminAppointmentTools } from "./appointments.tools";
import { sharedServiceTools, adminServiceTools } from "./services.tools";
import { sharedProductTools, adminProductTools } from "./products.tools";
import { customerOrderTools, staffOrderTools, adminOrderTools } from "./orders.tools";
import { staffClientTools, adminClientTools } from "./clients.tools";
import { sharedStaffTools, adminStaffTools } from "./staff.tools";
import { customerConsultationTools, staffConsultationTools } from "./consultation.tools";
import {
  customerTreatmentPlanTools,
  staffTreatmentPlanTools,
  adminTreatmentPlanTools,
} from "./treatment-plans.tools";
import { settingsTools } from "./settings.tools";
import { reportsTools } from "./reports.tools";

const customerTools: StructuredToolInterface[] = [
  ...myProfileTools,
  ...customerAppointmentTools,
  ...sharedServiceTools,
  ...sharedProductTools,
  ...sharedStaffTools,
  ...customerOrderTools,
  ...customerConsultationTools,
  ...customerTreatmentPlanTools,
];

const staffTools: StructuredToolInterface[] = [
  ...myProfileTools,
  ...staffAppointmentTools,
  ...sharedServiceTools,
  ...sharedProductTools,
  ...sharedStaffTools,
  ...staffOrderTools,
  ...staffClientTools,
  ...staffConsultationTools,
  ...staffTreatmentPlanTools,
];

const adminTools: StructuredToolInterface[] = [
  ...myProfileTools,
  ...adminAppointmentTools,
  ...adminServiceTools,
  ...adminProductTools,
  ...adminStaffTools,
  ...adminOrderTools,
  ...adminClientTools,
  ...staffConsultationTools,
  ...adminTreatmentPlanTools,
  ...settingsTools,
  ...reportsTools,
];

export function getRoleTools(userRole: string): StructuredToolInterface[] {
  if (userRole === "admin") return adminTools;
  if (userRole === "staff") return staffTools;
  return customerTools;
}

// Full union of all tools — used by ToolNode so it can execute any tool call regardless of role
export const allTools: StructuredToolInterface[] = [
  ...new Map([...customerTools, ...staffTools, ...adminTools].map((t) => [t.name, t])).values(),
];
