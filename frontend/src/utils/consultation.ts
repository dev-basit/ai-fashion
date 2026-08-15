import type { ConsultationField } from "@/types/database";

export function newConsultationField(): ConsultationField {
  return { id: crypto.randomUUID(), label: "", type: "text", required: false, options: [] };
}
