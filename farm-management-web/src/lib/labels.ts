import type { VisitStatus, VisitType } from "@/types";

export const statusLabels: Record<VisitStatus, string> = {
  Planned: "Planlandı",
  Completed: "Tamamlandı",
  Cancelled: "İptal edildi",
};

export const typeLabels: Record<VisitType, string> = {
  Routine: "Rutin",
  Training: "Eğitim",
  Inspection: "Denetim",
  Emergency: "Acil",
};

export const statusBadgeClasses: Record<VisitStatus, string> = {
  Planned: "bg-blue-50 text-blue-700",
  Completed: "bg-emerald-50 text-emerald-700",
  Cancelled: "bg-slate-100 text-slate-600",
};

export function formatDate(value: string | null): string {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("tr-TR");
}