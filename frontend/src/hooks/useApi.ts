// Resurslar uchun React Query hooks.

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api, getErrorMessage } from "@/lib/api";
import type {
  StatsResponse,
  Branch,
  BranchFull,
  Admin,
  ClientLite,
  DebtItem,
  AuditLogItem,
  ItemType,
  PaymentMethod,
} from "@/types/api";

// ----- STATS -----
export function useStats(branchId?: number | null) {
  return useQuery({
    queryKey: ["stats", branchId ?? "all"],
    queryFn: async () => {
      const r = await api.get<StatsResponse>("/stats", {
        params: branchId ? { branchId } : {},
      });
      return r.data;
    },
    refetchInterval: 30_000,
  });
}

// ----- LIST (filtrli ro'yxat: qarzdorlar, status, oylik) -----
export function useFilteredList(filter: string, branchId?: number | null) {
  return useQuery({
    queryKey: ["list", filter, branchId ?? "all"],
    queryFn: async () => {
      const r = await api.get<{
        kind: "debts" | "payments";
        title: string;
        items: any[];
      }>("/list", { params: { filter, ...(branchId ? { branchId } : {}) } });
      return r.data;
    },
    enabled: !!filter,
  });
}

// ----- CLIENTS -----
export interface ClientWithStats extends ClientLite {
  isDeleted: boolean;
  activeDebtsCount: number;
  createdAt: string;
}
export function useClientsAll(branchId?: number | null) {
  return useQuery({
    queryKey: ["clients", branchId ?? "all"],
    queryFn: async () => {
      const r = await api.get<{ total: number; totalRemaining: number; items: ClientWithStats[] }>(
        "/clients/all",
        { params: branchId ? { branchId } : {} },
      );
      return r.data;
    },
  });
}

export function useClientSearch(q: string) {
  return useQuery({
    queryKey: ["clients-search", q],
    queryFn: async () => {
      const r = await api.get<{ items: ClientLite[] }>("/search/clients", {
        params: { q },
      });
      return r.data.items;
    },
    enabled: q.length >= 2,
  });
}

export function useClient(id: number | null) {
  return useQuery({
    queryKey: ["client", id],
    queryFn: async () => {
      const r = await api.get<{
        client: ClientLite;
        summary: {
          debtsCount: number;
          paymentsCount: number;
          totalAmount: number;
          totalPaid: number;
          totalRemaining: number;
        };
        debts: DebtItem[];
        auditLogs: AuditLogItem[];
      }>(`/client/${id}`);
      return r.data;
    },
    enabled: !!id,
  });
}

export function useCreateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      phone: string;
      branchId?: number;
      notes?: string | null;
    }) => {
      const r = await api.post("/clients", data);
      return r.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clients"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
      toast.success("Mijoz qo'shildi");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useUpdateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: number;
      name?: string;
      phone?: string;
      notes?: string | null;
    }) => {
      const r = await api.patch(`/clients/${id}`, data);
      return r.data;
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["clients"] });
      qc.invalidateQueries({ queryKey: ["client", v.id] });
      toast.success("Saqlandi");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useToggleBlacklist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      isBlacklisted,
      reason,
    }: {
      id: number;
      isBlacklisted: boolean;
      reason?: string | null;
    }) => {
      // Backend `blacklist` field kutadi
      const r = await api.patch(`/clients/${id}/blacklist`, {
        blacklist: isBlacklisted,
        reason,
      });
      return r.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clients"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
      toast.success("Qora ro'yxat yangilandi");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useSoftDeleteClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const r = await api.post(`/clients/${id}/soft-delete`);
      return r.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clients"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
      toast.success("Mijoz arxivga ko'chirildi");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

// ----- DEBTS -----
export function useCreateDebt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      clientId?: number;
      newClient?: { name: string; phone: string; notes?: string | null };
      branchId?: number;
      itemType: ItemType;
      itemDetails?: string | null;
      amount: number;
      borrowedDate?: string;
      dueDate?: string | null;
      dueDateUnknown?: boolean;
      notes?: string | null;
    }) => {
      const r = await api.post("/debts", data);
      return r.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["stats"] });
      qc.invalidateQueries({ queryKey: ["list"] });
      qc.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Qarz qo'shildi");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useUpdateDebt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number; [k: string]: unknown }) => {
      const r = await api.patch(`/debts/${id}`, data);
      return r.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["stats"] });
      qc.invalidateQueries({ queryKey: ["list"] });
      toast.success("Qarz tahrirlandi");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useRecordPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      debtId,
      ...data
    }: {
      debtId: number;
      amount: number;
      method: PaymentMethod;
      paidDate?: string;
      notes?: string | null;
    }) => {
      const r = await api.post(`/debts/${debtId}/payments`, data);
      return r.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["stats"] });
      qc.invalidateQueries({ queryKey: ["list"] });
      qc.invalidateQueries({ queryKey: ["client"] });
      toast.success("To'lov yozildi");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useSoftDeleteDebt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const r = await api.post(`/debts/${id}/soft-delete`);
      return r.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["stats"] });
      qc.invalidateQueries({ queryKey: ["list"] });
      toast.success("Qarz bekor qilindi");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useHardDeleteDebt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const r = await api.delete(`/debts/${id}`);
      return r.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["stats"] });
      qc.invalidateQueries({ queryKey: ["list"] });
      toast.success("O'chirildi");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

// ----- BRANCHES -----
export function useBranches() {
  return useQuery({
    queryKey: ["branches"],
    queryFn: async () => {
      const r = await api.get<BranchFull[]>("/branches/full");
      return r.data;
    },
  });
}

export function useCreateBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      address?: string | null;
      phone?: string | null;
    }) => {
      const r = await api.post<Branch>("/branches", data);
      return r.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["branches"] });
      toast.success("Filial yaratildi");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useUpdateBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number; [k: string]: unknown }) => {
      const r = await api.patch(`/branches/${id}`, data);
      return r.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["branches"] });
      toast.success("Filial yangilandi");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useDeleteBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, force }: { id: number; force?: boolean }) => {
      const r = await api.delete(`/branches/${id}`, { params: force ? { force: 1 } : {} });
      return r.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["branches"] });
      toast.success("Filial o'chirildi");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

// ----- ADMINS -----
export function useAdmins() {
  return useQuery({
    queryKey: ["admins"],
    queryFn: async () => {
      const r = await api.get<Admin[]>("/admins");
      return r.data;
    },
  });
}

export function useCreateAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      username: string;
      password: string;
      fullName: string;
      branchId: number | null;
      role?: "admin" | "owner";
    }) => {
      const r = await api.post<Admin>("/admins", data);
      return r.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admins"] });
      toast.success("Admin qo'shildi");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useUpdateAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number; [k: string]: unknown }) => {
      const r = await api.patch(`/admins/${id}`, data);
      return r.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admins"] });
      toast.success("Admin yangilandi");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useDeleteAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const r = await api.delete(`/admins/${id}`);
      return r.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admins"] });
      toast.success("Admin o'chirildi");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useResetAdminPassword() {
  return useMutation({
    mutationFn: async ({ id, newPassword }: { id: number; newPassword: string }) => {
      const r = await api.post(`/admins/${id}/reset-password`, { newPassword });
      return r.data;
    },
    onSuccess: () => toast.success("Parol yangilandi"),
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

// ----- AUDIT -----
export function useAuditLogs(params?: {
  limit?: number;
  offset?: number;
  action?: string;
  tableName?: string;
}) {
  return useQuery({
    queryKey: ["audit", params],
    queryFn: async () => {
      const r = await api.get<AuditLogItem[]>("/audit-logs", { params });
      return r.data;
    },
  });
}

// ----- SETTINGS -----
export type SettingsMap = Record<string, { value: string; type: string }>;
export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const r = await api.get<SettingsMap>("/settings");
      return r.data;
    },
  });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, string | number | boolean | null>) => {
      const r = await api.patch("/settings", data);
      return r.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Sozlamalar saqlandi");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

// ----- DEBTORS (mijozlar guruhlangan, qoldiq qarzga ega) -----
export interface DebtorSummary {
  id: number;
  name: string;
  phone: string;
  notes: string | null;
  branch: string;
  branchId: number;
  debtsCount: number;
  activeDebtsCount: number;
  totalDebt: number;
  totalPaid: number;
  totalRemaining: number;
  lastPaymentDate: string | null;
  oldestActiveDate: string | null;
  hasOverdue: boolean;
}
export function useDebtors(branchId?: number | null) {
  return useQuery({
    queryKey: ["debtors", branchId ?? "all"],
    queryFn: async () => {
      const r = await api.get<{ total: number; totalRemaining: number; items: DebtorSummary[] }>(
        "/debtors",
        { params: branchId ? { branchId } : {} },
      );
      return r.data;
    },
  });
}

// ----- RANGE REPORT (sana oraliq, datetime aniqligida) -----
export interface RangeReport {
  from: string;
  to: string;
  summary: {
    debtsCount: number;
    totalDebtAdded: number;
    paymentsCount: number;
    totalPaid: number;
    cashTotal: number;
    cardTotal: number;
    transferTotal: number;
  };
  byBranch: Array<{
    id: number;
    name: string;
    debtsCount: number;
    debtsAmount: number;
    paymentsCount: number;
    paymentsAmount: number;
  }>;
  byAdmin: Array<{
    id: number;
    name: string;
    debtsCount: number;
    debtsAmount: number;
    paymentsCount: number;
    paymentsAmount: number;
  }>;
  daily: Array<{
    date: string;
    debtsAmount: number;
    paymentsAmount: number;
    debtsCount: number;
    paymentsCount: number;
  }>;
}
export function useRangeReport(from: string, to: string, branchId?: number | null) {
  return useQuery({
    queryKey: ["range-report", from, to, branchId ?? "all"],
    queryFn: async () => {
      const r = await api.get<RangeReport>("/reports/range", {
        params: { from, to, ...(branchId ? { branchId } : {}) },
      });
      return r.data;
    },
    enabled: !!from && !!to,
  });
}
