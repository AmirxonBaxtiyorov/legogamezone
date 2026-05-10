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

/**
 * Til-aware qisqa relative vaqt.
 * Misol: "5 daqiqa oldin", "3 soat oldin", "in 2 days".
 * t — i18n funksiyasi (`useT().t`).
 */
export function formatRelativeI18n(
  date: Date | string | null | undefined,
  t: (k: string, fb?: string) => string,
): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "—";
  const diffMs = Date.now() - d.getTime();
  const past = diffMs >= 0;
  const abs = Math.abs(diffMs);
  const minutes = Math.floor(abs / 60_000);
  const hours = Math.floor(abs / 3_600_000);
  const days = Math.floor(abs / 86_400_000);

  if (minutes < 1) return t("time.justNow");
  if (past) {
    if (minutes < 60) return `${minutes} ${t("time.minutesAgo")}`;
    if (hours < 24) return `${hours} ${t("time.hoursAgo")}`;
    return `${days} ${t("time.daysAgo")}`;
  } else {
    if (minutes < 60) return `${minutes} ${t("time.inMinutes")}`;
    if (hours < 24) return `${hours} ${t("time.inHours")}`;
    return `${days} ${t("time.inDays")}`;
  }
}

// 2099 sanasi noma'lum sentinel
export function isUnknownDue(date: Date | string | null | undefined): boolean {
  if (!date) return false;
  const d = typeof date === "string" ? new Date(date) : date;
  return d.getUTCFullYear() >= 2099;
}
