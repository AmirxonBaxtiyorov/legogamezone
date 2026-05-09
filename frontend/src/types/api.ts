// Backend API javob turlari.

export type Role = "owner" | "admin";
export type DebtStatus = "active" | "partial" | "paid" | "overdue" | "cancelled";
export type ItemType = "playstation" | "computer" | "billiard" | "other";
export type PaymentMethod = "cash" | "card" | "transfer";

export interface Branch {
  id: number;
  name: string;
  address: string | null;
  phone: string | null;
  isActive: boolean;
}

export interface BranchFull extends Branch {
  clientsCount: number;
  debtsCount: number;
  totalRemaining: number;
}

export interface Admin {
  id: number;
  username: string;
  fullName: string;
  role: Role;
  branchId: number | null;
  branchName?: string | null;
  isActive: boolean;
  lastLoginAt: string | null;
}

export interface ClientLite {
  id: number;
  name: string;
  phone: string;
  branchId: number;
  branch?: string;
  notes: string | null;
  isBlacklisted: boolean;
  blacklistReason: string | null;
  blacklistedAt: string | null;
  debtsCount?: number;
  totalRemaining?: number;
  hasOverdue?: boolean;
  createdAt?: string;
  isDeleted?: boolean;
  activeDebtsCount?: number;
}

export interface DebtItem {
  id: number;
  clientId: number;
  client: string;
  clientPhone: string;
  clientNotes?: string | null;
  branch: string;
  branchId?: number;
  itemType: ItemType;
  itemDetails: string | null;
  amount: number;
  paidAmount: number;
  remainingAmount: number;
  borrowedDate: string;
  dueDate: string;
  status: DebtStatus;
  notes: string | null;
  createdBy: string;
  createdAt: string;
  payments: PaymentItem[];
  auditLogs?: AuditLogItem[] | null;
}

export interface PaymentItem {
  id: number;
  amount: number;
  method: PaymentMethod;
  paidDate: string;
  notes: string | null;
  debtId?: number;
  debtAmount?: number;
  debtRemaining?: number;
  debtItem?: string;
  debtItemType?: ItemType;
  client?: string;
  clientId?: number;
  clientPhone?: string;
  branch?: string;
  recordedBy?: string;
}

export interface AuditLogItem {
  id: number;
  action: string;
  tableName: string;
  recordId: number;
  user: string;
  userId?: number;
  branch: string | null;
  oldValue?: string | null;
  newValue?: string | null;
  createdAt: string;
}

export interface StatsResponse {
  generatedAt: string;
  viewer: { fullName: string; role: Role; branchName: string | null; branchId: number | null };
  summary: {
    branchesCount: number;
    usersCount: number;
    ownersCount: number;
    adminsCount: number;
    clientsCount: number;
    debtsCount: number;
    paymentsCount: number;
    auditCount: number;
  };
  money: {
    totalDebt: number;
    totalPaid: number;
    totalRemaining: number;
    cashThisMonth: number;
    cardThisMonth: number;
    transferThisMonth: number;
    thisMonthTotal: number;
  };
  statusCounts: {
    active: number;
    partial: number;
    paid: number;
    overdue: number;
    cancelled: number;
    dueToday: number;
  };
  branches: Array<{
    id: number;
    name: string;
    clientsCount: number;
    debtsCount: number;
    totalAmount: number;
    totalPaid: number;
    totalRemaining: number;
    activeCount: number;
    overdueCount: number;
    paymentsCount: number;
  }>;
  topClients: Array<{
    clientId: number;
    name: string;
    phone: string;
    branch: string;
    totalRemaining: number;
  }>;
  recentDebts: DebtItem[];
  recentPayments: PaymentItem[];
  recentAudits: AuditLogItem[];
  itemBreakdown: Array<{ type: ItemType; count: number; amount: number }>;
  timeseries: Array<{
    date: string;
    debtAdded: number;
    paid: number;
    debtsCount: number;
    paymentsCount: number;
  }>;
}
