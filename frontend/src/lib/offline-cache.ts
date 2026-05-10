// Offline cache — qarzdorlar ro'yxati va snapshot ma'lumotlari
// localStorage'da saqlanadi. Server o'chgan paytda ham ko'rsatish mumkin.

import { api } from "@/lib/api";

const KEY_DEBTORS = "gz-cache-debtors";
const KEY_DEBTORS_AT = "gz-cache-debtors-at";

export interface CachedDebtor {
  id: number;
  name: string;
  phone: string;
  notes: string | null;
  branchId: number;
  branchName: string;
  isBlacklisted: boolean;
  totalRemaining: number;
  debts: Array<{
    id: number;
    amount: string;
    paidAmount: string;
    remainingAmount: string;
    status: string;
    itemType: string;
    itemDetails: string | null;
    borrowedDate: string;
    dueDate: string;
  }>;
}

export interface DebtorsCache {
  generatedAt: string;
  total: number;
  items: CachedDebtor[];
}

export function readDebtorsCache(): DebtorsCache | null {
  try {
    const raw = localStorage.getItem(KEY_DEBTORS);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function writeDebtorsCache(data: DebtorsCache): void {
  try {
    localStorage.setItem(KEY_DEBTORS, JSON.stringify(data));
    localStorage.setItem(KEY_DEBTORS_AT, new Date().toISOString());
  } catch {
    // localStorage to'lib qolsa, jim turamiz
  }
}

export function debtorsCachedAt(): string | null {
  return localStorage.getItem(KEY_DEBTORS_AT);
}

export function clearDebtorsCache(): void {
  localStorage.removeItem(KEY_DEBTORS);
  localStorage.removeItem(KEY_DEBTORS_AT);
}

/**
 * Server orqali keshni yangilaydi (login bo'lgan paytda, agar server ishlasa).
 * Xato bo'lsa, yutqazmaydi — eski kesh qoladi.
 */
export async function refreshDebtorsCache(): Promise<DebtorsCache | null> {
  try {
    const r = await api.get<DebtorsCache>("/backup/debtors");
    writeDebtorsCache(r.data);
    return r.data;
  } catch {
    return null;
  }
}

/**
 * Owner uchun to'liq snapshot yuklab olish (.json fayl).
 */
export async function downloadFullSnapshot(): Promise<void> {
  const r = await api.get("/backup/snapshot", { responseType: "blob" });
  const url = URL.createObjectURL(r.data as Blob);
  const a = document.createElement("a");
  a.href = url;
  const stamp = new Date().toISOString().slice(0, 10);
  a.download = `gamezone-snapshot-${stamp}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
