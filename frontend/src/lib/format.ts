// Pul, sana va vaqt format yordamchilari (Asia/Tashkent).

import { format, formatDistanceToNow } from "date-fns";
import { uz } from "date-fns/locale";

export function formatMoney(value: number | string | null | undefined): string {
  if (value == null) return "0 so'm";
  const n = typeof value === "number" ? value : Number(String(value).replace(/\s/g, ""));
  if (!Number.isFinite(n)) return "0 so'm";
  return `${n.toLocaleString("uz-UZ").replace(/,/g, " ")} so'm`;
}

export function formatNumber(value: number | string | null | undefined): string {
  if (value == null) return "0";
  const n = typeof value === "number" ? value : Number(String(value));
  if (!Number.isFinite(n)) return "0";
  return n.toLocaleString("uz-UZ").replace(/,/g, " ");
}

export function formatDate(date: Date | string | null | undefined, fmt = "dd.MM.yyyy"): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "—";
  return format(d, fmt, { locale: uz });
}

export function formatDateTime(date: Date | string | null | undefined): string {
  return formatDate(date, "dd.MM.yyyy HH:mm");
}

export function formatRelative(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "—";
  return formatDistanceToNow(d, { addSuffix: true, locale: uz });
}

// 2099 sanasi noma'lum sentinel
export function isUnknownDue(date: Date | string | null | undefined): boolean {
  if (!date) return false;
  const d = typeof date === "string" ? new Date(date) : date;
  return d.getUTCFullYear() >= 2099;
}
