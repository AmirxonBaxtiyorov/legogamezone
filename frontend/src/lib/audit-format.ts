// Audit yozuvlarini odam o'qiy oladigan tarzda formatlash.
// Til-aware: useT().t funksiyasini parametr orqali qabul qiladi.

import type { AuditLogItem } from "@/types/api";

type Tfunc = (key: string, fallback?: string) => string;

const formatMoney = (v: unknown): string => {
  const n = Number(v);
  if (!Number.isFinite(n)) return String(v ?? "");
  return n.toLocaleString("uz-UZ");
};

const itemTypeLabel = (t: string | null | undefined): string => {
  switch (t) {
    case "playstation":
      return "PlayStation";
    case "computer":
      return "Kompyuter";
    case "billiard":
      return "Bilyard";
    case "other":
      return "Boshqa";
    default:
      return t ?? "";
  }
};

const methodLabel = (m: string | null | undefined): string => {
  switch (m) {
    case "cash":
      return "naqd";
    case "card":
      return "karta";
    case "transfer":
      return "o'tkazma";
    default:
      return m ?? "";
  }
};

/**
 * Har bir audit yozuvi uchun batafsil tasvir yaratadi.
 * Masalan:
 *   "Asadbek to'lov yozdi: John Doe — 50 000 so'm (naqd)"
 *   "Asadbek qarz qo'shdi: John Doe — 100 000 so'm, PlayStation"
 *   "Asadbek mijoz qo'shdi: John Doe (+998901234567)"
 */
export function describeAudit(log: AuditLogItem, t: Tfunc): string {
  const action = t(`audit.action.${log.action}`, log.action);
  const table = t(`audit.table.${log.tableName}`, log.tableName);
  const newD = (log.newData ?? {}) as Record<string, unknown>;
  const oldD = (log.oldData ?? {}) as Record<string, unknown>;
  const meta = log.entityMeta ?? {};

  // Login / logout
  if (log.action === "login") {
    const success = (newD.success as boolean | undefined) ?? true;
    return success
      ? `${log.user} — ${t("audit.action.login")}`
      : `${log.user} — ${t("audit.action.login")} (${oldD.reason ?? "wrong_password"} ❌)`;
  }
  if (log.action === "logout") return `${log.user} — ${t("audit.action.logout")}`;

  // Backup
  if (log.action === "backup") {
    return `${log.user} — ${t("audit.action.backup")}`;
  }

  // Mijoz
  if (log.tableName === "Client") {
    const name =
      log.entityName ??
      (newD.name as string | undefined) ??
      (oldD.name as string | undefined) ??
      `#${log.recordId}`;
    const phone = (meta.phone as string | undefined) ?? (newD.phone as string | undefined) ?? "";
    if (log.action === "create") {
      return `${log.user} ${t("audit.action.create")}: ${name}${phone ? " (" + phone + ")" : ""}`;
    }
    if (log.action === "update") {
      // Qora ro'yxat o'zgarishi
      if ("isBlacklisted" in newD) {
        const bl = newD.isBlacklisted as boolean;
        return `${log.user} ${name}'ni ${bl ? "qora ro'yxatga qo'shdi" : "qora ro'yxatdan chiqardi"}${
          newD.reason ? " — " + newD.reason : ""
        }`;
      }
      return `${log.user} ${t("audit.action.update")}: ${name}`;
    }
    if (log.action === "soft_delete") return `${log.user} ${t("audit.action.soft_delete")}: ${name}`;
    if (log.action === "delete") return `${log.user} ${t("audit.action.delete")}: ${name}`;
    if (log.action === "restore") return `${log.user} ${t("audit.action.restore")}: ${name}`;
  }

  // Qarz
  if (log.tableName === "Debt") {
    const name = log.entityName ?? `#${log.recordId}`;
    const phone = (meta.phone as string | undefined) ?? "";
    if (log.action === "create") {
      const amount = (newD.amount as number | undefined) ?? meta.amount;
      const itemType = (newD.itemType as string | undefined) ?? (meta.itemType as string | undefined);
      return `${log.user} ${t("audit.action.create")} (qarz): ${name}${phone ? " " + phone : ""} — ${formatMoney(
        amount,
      )} so'm, ${itemTypeLabel(itemType)}`;
    }
    if (log.action === "update") {
      // Trigger=payment bo'lsa to'lov natijasi
      if (newD.trigger === "payment") {
        return `${log.user} ${name} qarzini yangiladi (to'lov natijasida): ${oldD.paidAmount ?? 0} → ${
          newD.paidAmount ?? 0
        } so'm, status=${newD.status}`;
      }
      const oldAmt = oldD.amount;
      const newAmt = newD.amount;
      if (oldAmt !== undefined && newAmt !== undefined && oldAmt !== newAmt) {
        return `${log.user} qarzni tahrirladi: ${name} — ${formatMoney(oldAmt)} → ${formatMoney(newAmt)} so'm`;
      }
      return `${log.user} qarzni tahrirladi: ${name}`;
    }
    if (log.action === "soft_delete") {
      return `${log.user} qarzni bekor qildi: ${name}${phone ? " " + phone : ""} — ${formatMoney(meta.amount)} so'm`;
    }
    if (log.action === "delete") {
      return `${log.user} qarzni butunlay o'chirdi: ${name}${phone ? " " + phone : ""}`;
    }
  }

  // To'lov
  if (log.tableName === "Payment") {
    const name = log.entityName ?? `#${log.recordId}`;
    const phone = (meta.phone as string | undefined) ?? "";
    if (log.action === "payment" || log.action === "create") {
      const amount = (newD.amount as number | undefined) ?? meta.amount;
      const method = (newD.method as string | undefined) ?? (meta.method as string | undefined);
      return `${log.user} pul qabul qildi: ${name}${phone ? " " + phone : ""} — ${formatMoney(
        amount,
      )} so'm (${methodLabel(method)})`;
    }
    return `${log.user} ${t(`audit.action.${log.action}`, log.action)} (${table} #${log.recordId})`;
  }

  // Filial
  if (log.tableName === "Branch") {
    const name = log.entityName ?? (newD.name as string | undefined) ?? (oldD.name as string | undefined) ?? `#${log.recordId}`;
    if (log.action === "create") return `${log.user} filial qo'shdi: ${name}`;
    if (log.action === "update") return `${log.user} filialni tahrirladi: ${name}`;
    if (log.action === "soft_delete") return `${log.user} filialni faolsizlantirdi: ${name}`;
    if (log.action === "delete") return `${log.user} filialni o'chirdi: ${name}`;
  }

  // Foydalanuvchi (admin)
  if (log.tableName === "User") {
    const name = log.entityName ?? (newD.fullName as string | undefined) ?? `#${log.recordId}`;
    if (log.action === "create") return `${log.user} admin qo'shdi: ${name} (${newD.username ?? ""})`;
    if (log.action === "update") {
      if ((newD as any).event === "password_reset")
        return `${log.user} ${name} parolini yangiladi`;
      if ((newD as any).permissions)
        return `${log.user} ${name} ruxsatlarini yangiladi`;
      return `${log.user} adminni tahrirladi: ${name}`;
    }
    if (log.action === "soft_delete") return `${log.user} adminni faolsizlantirdi: ${name}`;
    if (log.action === "delete") return `${log.user} adminni o'chirdi: ${name}`;
  }

  // AppSetting
  if (log.tableName === "AppSetting") {
    const keys = Object.keys(newD);
    return `${log.user} sozlamalarni yangiladi${keys.length ? ": " + keys.join(", ") : ""}`;
  }

  // Database (backup/restore)
  if (log.tableName === "Database") {
    return `${log.user} ${log.action === "backup" ? "backup yaratdi" : "bazani yangiladi (restore)"}`;
  }

  if (log.tableName === "Export") {
    return `${log.user} eksport oldi: ${(newD as any).kind ?? ""} (${(newD as any).format ?? ""})`;
  }

  // Default
  return `${log.user} ${action} (${table} #${log.recordId})`;
}
