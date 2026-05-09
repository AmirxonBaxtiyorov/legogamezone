import { Badge } from "@/components/ui/badge";
import type { DebtStatus } from "@/types/api";

const labelMap: Record<DebtStatus, string> = {
  active: "Faol",
  partial: "Qisman",
  paid: "To'liq to'langan",
  overdue: "Muddati o'tgan",
  cancelled: "Bekor qilingan",
};

const variantMap: Record<DebtStatus, "default" | "secondary" | "destructive" | "success" | "warning" | "outline"> = {
  active: "default",
  partial: "warning",
  paid: "success",
  overdue: "destructive",
  cancelled: "outline",
};

export function StatusBadge({ status }: { status: DebtStatus }) {
  return <Badge variant={variantMap[status] ?? "default"}>{labelMap[status] ?? status}</Badge>;
}
