import { useMemo, useState } from "react";
import { History, Search, Eye, Download } from "lucide-react";

import { useAuditLogs, useAdmins } from "@/hooks/useApi";
import { formatDateTime } from "@/lib/format";
import { useT } from "@/lib/i18n";
import { describeAudit } from "@/lib/audit-format";
import { api } from "@/lib/api";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { AuditLogItem } from "@/types/api";

const actionColor: Record<string, string> = {
  create: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  update: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  delete: "bg-red-500/15 text-red-700 dark:text-red-400",
  soft_delete: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  restore: "bg-teal-500/15 text-teal-700 dark:text-teal-400",
  payment: "bg-violet-500/15 text-violet-700 dark:text-violet-400",
  login: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-400",
  logout: "bg-slate-500/15 text-slate-700 dark:text-slate-400",
  permissions: "bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-400",
  backup: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400",
};

export function AuditPage() {
  const { t } = useT();
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [tableFilter, setTableFilter] = useState<string>("all");
  const [userFilter, setUserFilter] = useState<string>("all");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [details, setDetails] = useState<AuditLogItem | null>(null);

  const { data: items, isLoading } = useAuditLogs({
    limit: 500,
    action: actionFilter === "all" ? undefined : actionFilter,
    tableName: tableFilter === "all" ? undefined : tableFilter,
    userId: userFilter === "all" ? undefined : Number(userFilter),
    from: from || undefined,
    to: to || undefined,
  });

  const { data: admins } = useAdmins();

  const filtered = useMemo(() => {
    if (!items) return [];
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((a) => {
      const desc = describeAudit(a, t).toLowerCase();
      return (
        desc.includes(q) ||
        a.user.toLowerCase().includes(q) ||
        (a.entityName ?? "").toLowerCase().includes(q) ||
        (a.branch ?? "").toLowerCase().includes(q) ||
        a.action.toLowerCase().includes(q) ||
        a.tableName.toLowerCase().includes(q)
      );
    });
  }, [items, search, t]);

  const exportCsv = () => {
    if (!filtered.length) {
      toast.error(t("common.empty"));
      return;
    }
    const header = [
      t("audit.col.time"),
      t("audit.col.user"),
      t("audit.col.action"),
      t("audit.col.description"),
      t("audit.col.branch"),
      "IP",
    ];
    const rows = filtered.map((a) => [
      new Date(a.createdAt).toLocaleString(),
      a.user,
      a.action,
      describeAudit(a, t),
      a.branch ?? "",
      a.ipAddress ?? "",
    ]);
    const csv = [header, ...rows]
      .map((r) =>
        r
          .map((cell) => {
            const s = String(cell ?? "").replace(/"/g, '""');
            return /[",\n]/.test(s) ? `"${s}"` : s;
          })
          .join(","),
      )
      .join("\n");
    // BOM bilan — Excel'da to'g'ri ko'rinishi uchun
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const stamp = new Date().toISOString().slice(0, 10);
    a.download = `audit-${stamp}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadSnapshot = async () => {
    try {
      const r = await api.get("/backup/snapshot", { responseType: "blob" });
      const url = URL.createObjectURL(r.data as Blob);
      const a = document.createElement("a");
      a.href = url;
      const stamp = new Date().toISOString().slice(0, 10);
      a.download = `gamezone-snapshot-${stamp}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Snapshot yuklab olindi");
    } catch (e) {
      toast.error("Snapshot yuklab bo'lmadi");
    }
  };

  return (
    <div>
      <PageHeader
        title={t("audit.title")}
        description={t("audit.description")}
        showBranchFilter={false}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportCsv}>
              <Download className="size-4" />
              {t("audit.export")}
            </Button>
            <Button variant="outline" size="sm" onClick={downloadSnapshot}>
              <Download className="size-4" />
              Snapshot
            </Button>
          </div>
        }
      />

      <Card className="p-3 mb-3">
        <div className="flex flex-wrap gap-2 items-end">
          <div className="space-y-1 flex-1 min-w-[180px]">
            <Label className="text-xs">{t("common.search")}</Label>
            <div className="relative">
              <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder={t("audit.search.placeholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">{t("audit.col.action")}</Label>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("audit.filter.action")}</SelectItem>
                <SelectItem value="create">{t("audit.action.create")}</SelectItem>
                <SelectItem value="update">{t("audit.action.update")}</SelectItem>
                <SelectItem value="payment">{t("audit.action.payment")}</SelectItem>
                <SelectItem value="soft_delete">{t("audit.action.soft_delete")}</SelectItem>
                <SelectItem value="delete">{t("audit.action.delete")}</SelectItem>
                <SelectItem value="login">{t("audit.action.login")}</SelectItem>
                <SelectItem value="logout">{t("audit.action.logout")}</SelectItem>
                <SelectItem value="backup">{t("audit.action.backup")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Jadval</Label>
            <Select value={tableFilter} onValueChange={setTableFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("audit.filter.table")}</SelectItem>
                <SelectItem value="Client">{t("audit.table.Client")}</SelectItem>
                <SelectItem value="Debt">{t("audit.table.Debt")}</SelectItem>
                <SelectItem value="Payment">{t("audit.table.Payment")}</SelectItem>
                <SelectItem value="User">{t("audit.table.User")}</SelectItem>
                <SelectItem value="Branch">{t("audit.table.Branch")}</SelectItem>
                <SelectItem value="AppSetting">{t("audit.table.AppSetting")}</SelectItem>
                <SelectItem value="Database">{t("audit.table.Database")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">{t("audit.filter.user")}</Label>
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger className="w-[170px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("common.all")}</SelectItem>
                {admins?.map((a) => (
                  <SelectItem key={a.id} value={String(a.id)}>
                    {a.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">{t("audit.filter.dateFrom")}</Label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-[150px]" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">{t("audit.filter.dateTo")}</Label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-[150px]" />
          </div>
        </div>
      </Card>

      <Card>
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={History} title={t("audit.empty")} />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">{t("audit.col.time")}</TableHead>
                  <TableHead>{t("audit.col.user")}</TableHead>
                  <TableHead>{t("audit.col.action")}</TableHead>
                  <TableHead className="min-w-[280px]">{t("audit.col.description")}</TableHead>
                  <TableHead className="hidden md:table-cell">{t("audit.col.branch")}</TableHead>
                  <TableHead className="hidden lg:table-cell">{t("audit.col.ip")}</TableHead>
                  <TableHead className="text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((a) => (
                  <TableRow key={a.id} className="align-top">
                    <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                      {formatDateTime(a.createdAt)}
                    </TableCell>
                    <TableCell className="text-sm whitespace-nowrap font-medium">{a.user}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          actionColor[a.action] ?? "bg-muted"
                        }`}
                      >
                        {t(`audit.action.${a.action}`, a.action)}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">{describeAudit(a, t)}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {a.branch ?? "—"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-xs font-mono text-muted-foreground">
                      {a.ipAddress ?? "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDetails(a)}
                        title={t("common.details")}
                      >
                        <Eye className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Tafsilot modal */}
      <Dialog open={!!details} onOpenChange={(o) => !o && setDetails(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {t("audit.col.action")}: {t(`audit.action.${details?.action}`, details?.action)}
            </DialogTitle>
            <DialogDescription>
              {details && describeAudit(details, t)}
            </DialogDescription>
          </DialogHeader>
          {details && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <Field label={t("audit.col.time")} value={formatDateTime(details.createdAt)} />
                <Field label={t("audit.col.user")} value={`${details.user}${details.username ? " (" + details.username + ")" : ""}`} />
                <Field label={t("audit.col.branch")} value={details.branch ?? "—"} />
                <Field label="ID" value={`${details.tableName}#${details.recordId}`} mono />
                <Field label="IP" value={details.ipAddress ?? "—"} mono />
                <Field
                  label="User agent"
                  value={details.userAgent ? details.userAgent.slice(0, 60) + (details.userAgent.length > 60 ? "..." : "") : "—"}
                  mono
                />
              </div>
              {details.entityName && (
                <Field label="Yozuv" value={details.entityName} />
              )}
              {details.oldData != null && (
                <div>
                  <div className="text-xs font-semibold text-muted-foreground mb-1">
                    {t("audit.details.old")}
                  </div>
                  <pre className="bg-muted/50 rounded p-2 text-xs overflow-auto max-h-48">
                    {JSON.stringify(details.oldData, null, 2)}
                  </pre>
                </div>
              )}
              {details.newData != null && (
                <div>
                  <div className="text-xs font-semibold text-muted-foreground mb-1">
                    {t("audit.details.new")}
                  </div>
                  <pre className="bg-muted/50 rounded p-2 text-xs overflow-auto max-h-48">
                    {JSON.stringify(details.newData, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={mono ? "font-mono text-xs break-all" : "text-sm"}>{value}</div>
    </div>
  );
}
