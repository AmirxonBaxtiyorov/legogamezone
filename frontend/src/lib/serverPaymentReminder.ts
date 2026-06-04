// Server to'lov sanasi eslatmasi — urgency va matn yordamchilari.

export type ServerPaymentUrgency = "overdue" | "today" | "soon" | "upcoming";

export interface ServerPaymentStatus {
  paymentDate: string;
  daysUntil: number;
  urgency: ServerPaymentUrgency;
}

export function getServerPaymentStatus(
  dateStr: string | null | undefined,
): ServerPaymentStatus | null {
  if (!dateStr?.trim()) return null;
  const paymentDate = new Date(`${dateStr.trim()}T00:00:00`);
  if (isNaN(paymentDate.getTime())) return null;

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const paymentStart = new Date(paymentDate);
  paymentStart.setHours(0, 0, 0, 0);

  const daysUntil = Math.round(
    (paymentStart.getTime() - startOfToday.getTime()) / 86_400_000,
  );

  let urgency: ServerPaymentUrgency = "upcoming";
  if (daysUntil < 0) urgency = "overdue";
  else if (daysUntil === 0) urgency = "today";
  else if (daysUntil <= 7) urgency = "soon";

  return { paymentDate: dateStr.trim(), daysUntil, urgency };
}

export function serverPaymentStyles(urgency: ServerPaymentUrgency) {
  switch (urgency) {
    case "overdue":
      return {
        border: "border-red-500/40",
        bg: "bg-red-500/10",
        text: "text-red-600 dark:text-red-400",
        icon: "text-red-500",
        pulse: true,
      };
    case "today":
      return {
        border: "border-orange-500/40",
        bg: "bg-orange-500/10",
        text: "text-orange-600 dark:text-orange-400",
        icon: "text-orange-500",
        pulse: true,
      };
    case "soon":
      return {
        border: "border-amber-500/40",
        bg: "bg-amber-500/10",
        text: "text-amber-600 dark:text-amber-400",
        icon: "text-amber-500",
        pulse: false,
      };
    default:
      return {
        border: "border-amber-500/30",
        bg: "bg-amber-500/10",
        text: "text-amber-600 dark:text-amber-400",
        icon: "text-amber-500",
        pulse: false,
      };
  }
}

export function formatServerPaymentReminder(
  t: (k: string, fb?: string) => string,
  status: ServerPaymentStatus,
  formattedDate: string,
): string {
  const { urgency, daysUntil } = status;
  if (urgency === "overdue") {
    const days = Math.abs(daysUntil);
    return t("serverPayment.reminder.overdue", `Server to'lovi muddati o'tgan! ${formattedDate} (${days} kun oldin)`)
      .replace("{date}", formattedDate)
      .replace("{days}", String(days));
  }
  if (urgency === "today") {
    return t("serverPayment.reminder.today", "Bugun server to'lovi kuni!");
  }
  if (urgency === "soon") {
    return t("serverPayment.reminder.soon", `Server to'loviga ${daysUntil} kun qoldi (${formattedDate})`)
      .replace("{days}", String(daysUntil))
      .replace("{date}", formattedDate);
  }
  return t("serverPayment.reminder.upcoming", `Server to'lov kuni: ${formattedDate} (${daysUntil} kun qoldi)`)
    .replace("{date}", formattedDate)
    .replace("{days}", String(daysUntil));
}
