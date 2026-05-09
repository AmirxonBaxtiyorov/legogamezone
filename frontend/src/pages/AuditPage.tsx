import { useMemo, useState } from "react";
import { History, Search } from "lucide-react";

import { useAuditLogs } from "@/hooks/useApi";
import { formatDateTime } from "@/lib/format";

import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
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

const actionColor: Record<string, string> = {
  create: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  update: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  delete: "bg-red-500/15 text-red-700 dark:text-red-400",
  soft_delete: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  payment: "bg-violet-500/15 text-violet-700 dark:text-violet-400",
  login: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-400",
  logout: "bg-slate-500/15 text-slate-700 dark:text-slate-400",
  permissions: "bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-400",
};

export function AuditPage() {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [tableFilter, setTableFilter] = useState<string>("all");

  const { data: items, isLoading } = useAuditLogs({
    limit: 200,
    action: actionFilter === "all" ? undefined : actionFilter,
    tableName: tableFilter === "all" ? undefined : tableFilter,
  });

  const filtered = useMemo(() => {
    if (!items) return [];
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (a) =>
        a.user.toLowerCase().includes(q) ||
        a.tableName.toLowerCase().includes(q) ||
        a.action.toLowerCase().includes(q) ||
        (a.branch?.toLowerCase().includes(q) ?? false),
    );
  }, [items, search]);

  return (
    <div>
      <PageHeader
        title="Audit log"
        description="Tizimdagi barcha o'zgarishlar va kirishlar"
        showBranchFilter={false}
      />

      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Qidiruv..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barcha amallar</SelectItem>
            <SelectItem value="create">create</SelectItem>
            <SelectItem value="update">update</SelectItem>
            <SelectItem value="delete">delete</SelectItem>
            <SelectItem value="soft_delete">soft_delete</SelectItem>
            <SelectItem value="payment">payment</SelectItem>
            <SelectItem value="login">login</SelectItem>
            <SelectItem value="logout">logout</SelectItem>
          </SelectContent>
        </Select>
        <Select value={tableFilter} onValueChange={setTableFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barcha jadvallar</SelectItem>
            <SelectItem value="User">User</SelectItem>
            <SelectItem value="Client">Client</SelectItem>
            <SelectItem value="Debt">Debt</SelectItem>
            <SelectItem value="Payment">Payment</SelectItem>
            <SelectItem value="Branch">Branch</SelectItem>
            <SelectItem value="AppSetting">AppSetting</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={History} title="Audit yozuvlari yo'q" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vaqt</TableHead>
                <TableHead>Foydalanuvchi</TableHead>
                <TableHead>Amal</TableHead>
                <TableHead>Jadval</TableHead>
                <TableHead>Yozuv</TableHead>
                <TableHead className="hidden md:table-cell">Filial</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="text-sm whitespace-nowrap">{formatDateTime(a.createdAt)}</TableCell>
                  <TableCell className="text-sm">{a.user}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${actionColor[a.action] ?? "bg-muted"}`}
                    >
                      {a.action}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm font-mono text-muted-foreground">{a.tableName}</TableCell>
                  <TableCell className="text-sm">#{a.recordId}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {a.branch ?? "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
