import { useState } from "react";
import {
  Users,
  CreditCard,
  Wallet,
  ChevronRight,
  Clock,
  BarChart3,
} from "lucide-react";

import { useUsersStats, useUserStats } from "@/hooks/useApi";
import { useBranchFilterStore } from "@/store/branchFilter";
import { formatMoney, formatNumber, formatDateTime, formatDate } from "@/lib/format";
import { useT } from "@/lib/i18n";
import type { UserStatsItem } from "@/types/api";

import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const statusBadge: Record<string, string> = {
  active: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  partial: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  paid: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
  overdue: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  cancelled: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

const methodLabels: Record<string, string> = {
  cash: "Naqd",
  card: "Karta",
  transfer: "O'tkazma",
};

const actionLabels: Record<string, string> = {
  create: "Qo'shdi",
  update: "Tahrirladi",
  delete: "O'chirdi",
  soft_delete: "Arxivladi",
  restore: "Tikladi",
  payment: "To'lov yozdi",
  login: "Kirdi",
  logout: "Chiqdi",
  backup: "Backup",
};

export function UsersPage() {
  const branchId = useBranchFilterStore((s) => s.branchId);
  const { data, isLoading } = useUsersStats(branchId);
  const { t } = useT();
  const [selected, setSelected] = useState<UserStatsItem | null>(null);

  return (
    <div>
      <PageHeader
        title={t("users.title")}
        description={t("users.description")}
        showBranchFilter
      />

      {/* Summary cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Users className="size-4" />
              {t("users.title")}
            </div>
            <div className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-16" /> : data?.totalUsers ?? 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <CreditCard className="size-4" />
              {t("users.col.debts")}
            </div>
            <div className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-20" /> : data ? `${formatNumber(data.totalDebtsCount)} ta` : "0"}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {data ? formatMoney(data.totalDebtsAmount) : ""}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Wallet className="size-4" />
              {t("users.col.payments")}
            </div>
            <div className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-20" /> : data ? `${formatNumber(data.totalPaymentsCount)} ta` : "0"}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {data ? formatMoney(data.totalPaymentsAmount) : ""}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <BarChart3 className="size-4" />
              {t("users.detail.action")}
            </div>
            <div className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-16" /> : data ? formatNumber(data.items.reduce((a, i) => a + i.debtsCount + i.paymentsCount, 0)) : "0"}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {t("users.detail.date")}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users table */}
      <Card>
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Users className="size-10 mx-auto mb-3 opacity-40" />
            {t("common.empty")}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("users.col.username")}</TableHead>
                  <TableHead>{t("users.col.name")}</TableHead>
                  <TableHead>{t("users.col.role")}</TableHead>
                  <TableHead className="hidden md:table-cell">{t("users.col.branch")}</TableHead>
                  <TableHead className="text-right">{t("users.col.debts")}</TableHead>
                  <TableHead className="text-right">{t("users.col.payments")}</TableHead>
                  <TableHead className="hidden lg:table-cell">{t("users.col.lastLogin")}</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((u) => (
                  <TableRow
                    key={u.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelected(u)}
                  >
                    <TableCell className="font-mono text-sm">{u.username}</TableCell>
                    <TableCell className="font-medium">{u.fullName}</TableCell>
                    <TableCell>
                      <Badge variant={u.role === "owner" ? "default" : "outline"}>
                        {u.role === "owner" ? "Owner" : "Admin"}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {u.branchName ?? "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-semibold">{u.debtsCount} ta</span>
                        <span className="text-xs text-muted-foreground">{formatMoney(u.debtsAmount)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-semibold">{u.paymentsCount} ta</span>
                        <span className="text-xs text-muted-foreground">{formatMoney(u.paymentsAmount)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                      {u.lastLoginAt ? formatDateTime(u.lastLoginAt) : "—"}
                    </TableCell>
                    <TableCell>
                      <ChevronRight className="size-4 text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* User detail dialog */}
      <UserDetailDialog userId={selected?.id ?? null} onClose={() => setSelected(null)} />
    </div>
  );
}

function UserDetailDialog({ userId, onClose }: { userId: number | null; onClose: () => void }) {
  const { data, isLoading } = useUserStats(userId);
  const { t } = useT();
  const [tab, setTab] = useState("debts");

  if (!userId) return null;

  return (
    <Dialog open={!!userId} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isLoading ? (
              <Skeleton className="h-6 w-48" />
            ) : (
              <>
                <span>{data?.user.fullName}</span>
                <Badge variant={data?.user.role === "owner" ? "default" : "outline"}>
                  {data?.user.role === "owner" ? "Owner" : "Admin"}
                </Badge>
                <span className="text-sm font-normal text-muted-foreground">
                  @{data?.user.username}
                </span>
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : data ? (
          <>
            {/* Summary */}
            <div className="grid gap-3 grid-cols-2 md:grid-cols-4 mb-4">
              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground">{t("users.detail.branch")}</div>
                <div className="font-semibold mt-1">{data.user.branchName ?? "—"}</div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground">{t("users.summary.debts")}</div>
                <div className="font-semibold mt-1 text-lg">
                  {formatNumber(data.summary.debtsCount)}
                </div>
                <div className="text-xs text-muted-foreground">{formatMoney(data.summary.debtsAmount)}</div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground">{t("users.summary.payments")}</div>
                <div className="font-semibold mt-1 text-lg">
                  {formatNumber(data.summary.paymentsCount)}
                </div>
                <div className="text-xs text-muted-foreground">{formatMoney(data.summary.paymentsAmount)}</div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground">{t("users.col.lastLogin")}</div>
                <div className="font-semibold mt-1">
                  {data.user.lastLoginAt ? formatDateTime(data.user.lastLoginAt) : "—"}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="debts">
                  <CreditCard className="size-3.5 mr-1.5" />
                  {t("users.detail.debts")} ({data.summary.debtsCount})
                </TabsTrigger>
                <TabsTrigger value="payments">
                  <Wallet className="size-3.5 mr-1.5" />
                  {t("users.detail.payments")} ({data.summary.paymentsCount})
                </TabsTrigger>
                <TabsTrigger value="audit">
                  <Clock className="size-3.5 mr-1.5" />
                  {t("users.detail.audit")} ({data.auditLogs.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="debts">
                {data.debts.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8 text-sm">{t("common.empty")}</div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>#</TableHead>
                          <TableHead>{t("users.detail.client")}</TableHead>
                          <TableHead className="hidden sm:table-cell">{t("users.detail.branch")}</TableHead>
                          <TableHead>{t("users.detail.amount")}</TableHead>
                          <TableHead>{t("users.detail.status")}</TableHead>
                          <TableHead className="hidden md:table-cell">{t("users.detail.date")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.debts.map((d, i) => (
                          <TableRow key={d.id}>
                            <TableCell className="text-muted-foreground text-xs">{i + 1}</TableCell>
                            <TableCell>
                              <div className="font-medium">{d.client}</div>
                              <div className="text-xs text-muted-foreground">{d.clientPhone}</div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell text-sm">{d.branch}</TableCell>
                            <TableCell>
                              <div className="font-semibold">{formatMoney(d.amount)}</div>
                              <div className="text-xs text-muted-foreground">
                                {d.paidAmount > 0 ? `To'langan: ${formatMoney(d.paidAmount)}` : ""}
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${statusBadge[d.status] || ""}`}>
                                {d.status === "active" ? "Faol" : d.status === "partial" ? "Qisman" : d.status === "paid" ? "To'langan" : d.status === "overdue" ? "Muddati o'tgan" : "Bekor"}
                              </span>
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                              {formatDate(d.createdAt)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="payments">
                {data.payments.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8 text-sm">{t("common.empty")}</div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>#</TableHead>
                          <TableHead>{t("users.detail.client")}</TableHead>
                          <TableHead className="hidden sm:table-cell">{t("users.detail.branch")}</TableHead>
                          <TableHead>{t("users.detail.amount")}</TableHead>
                          <TableHead>{t("users.detail.method")}</TableHead>
                          <TableHead className="hidden md:table-cell">{t("users.detail.date")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.payments.map((p, i) => (
                          <TableRow key={p.id}>
                            <TableCell className="text-muted-foreground text-xs">{i + 1}</TableCell>
                            <TableCell className="font-medium">{p.client}</TableCell>
                            <TableCell className="hidden sm:table-cell text-sm">{p.branch}</TableCell>
                            <TableCell className="font-semibold text-emerald-600">{formatMoney(p.amount)}</TableCell>
                            <TableCell>
                              <span className="text-xs bg-muted px-2 py-0.5 rounded">{methodLabels[p.method] || p.method}</span>
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                              {formatDate(p.paidDate)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="audit">
                {data.auditLogs.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8 text-sm">{t("common.empty")}</div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>#</TableHead>
                          <TableHead>{t("users.detail.action")}</TableHead>
                          <TableHead>{t("audit.filter.table")}</TableHead>
                          <TableHead className="hidden sm:table-cell">{t("users.detail.branch")}</TableHead>
                          <TableHead className="hidden md:table-cell">{t("users.detail.date")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.auditLogs.map((a, i) => (
                          <TableRow key={a.id}>
                            <TableCell className="text-muted-foreground text-xs">{i + 1}</TableCell>
                            <TableCell>
                              <span className="text-sm">{actionLabels[a.action] || a.action}</span>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">{a.tableName}</TableCell>
                            <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{a.branch ?? "—"}</TableCell>
                            <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                              {formatDateTime(a.createdAt)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
