import { useState, useMemo } from "react";
import {
  Receipt,
  ArrowUpCircle,
  ArrowDownCircle,
  Search,
} from "lucide-react";

import { useTransactions } from "@/hooks/useApi";
import { formatMoney, formatDate } from "@/lib/format";
import { useT } from "@/lib/i18n";

import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

type FilterType = "all" | "debt" | "payment";

export function TransactionsPage() {
  const { t } = useT();
  const { data, isLoading } = useTransactions();
  const [tab, setTab] = useState<FilterType>("all");
  const [search, setSearch] = useState("");

  const items = useMemo(() => {
    if (!data?.transactions) return [];
    let list = data.transactions;
    if (tab !== "all") list = list.filter((x) => x.type === tab);
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (x) =>
        x.clientName.toLowerCase().includes(q) ||
        x.clientPhone.toLowerCase().includes(q) ||
        x.adminName.toLowerCase().includes(q) ||
        x.branch.toLowerCase().includes(q),
    );
  }, [data, search, tab]);

  const debtCount = data?.transactions.filter((x) => x.type === "debt").length ?? 0;
  const paymentCount = data?.transactions.filter((x) => x.type === "payment").length ?? 0;
  const totalDebtAmount = data?.transactions.filter((x) => x.type === "debt").reduce((a, x) => a + x.amount, 0) ?? 0;
  const totalPaymentAmount = data?.transactions.filter((x) => x.type === "payment").reduce((a, x) => a + x.amount, 0) ?? 0;

  return (
    <div>
      <PageHeader
        title={t("transactions.title")}
        description={t("transactions.description")}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Card className="p-4 flex items-center gap-3">
          <ArrowDownCircle className="size-8 text-orange-500 shrink-0" />
          <div>
            <div className="text-sm text-muted-foreground">{t("transactions.summaryDebts")}</div>
            <div className="text-xl font-bold">{formatMoney(totalDebtAmount)}</div>
            <div className="text-xs text-muted-foreground">{debtCount} ta</div>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <ArrowUpCircle className="size-8 text-emerald-500 shrink-0" />
          <div>
            <div className="text-sm text-muted-foreground">{t("transactions.summaryPayments")}</div>
            <div className="text-xl font-bold">{formatMoney(totalPaymentAmount)}</div>
            <div className="text-xs text-muted-foreground">{paymentCount} ta</div>
          </div>
        </Card>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as FilterType)} className="mb-4">
        <TabsList>
          <TabsTrigger value="all">{t("transactions.filterAll")}</TabsTrigger>
          <TabsTrigger value="debt">{t("transactions.filterDebts")}</TabsTrigger>
          <TabsTrigger value="payment">{t("transactions.filterPayments")}</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mb-4 max-w-sm relative">
        <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Mijoz, admin, filial..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card>
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="Hech narsa topilmadi"
            description={search ? "Qidiruv natijasi bo'sh" : "Tranzaksiyalar yo'q"}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("transactions.col.type")}</TableHead>
                <TableHead>{t("transactions.col.client")}</TableHead>
                <TableHead className="hidden md:table-cell">{t("transactions.col.item")}</TableHead>
                <TableHead>{t("transactions.col.amount")}</TableHead>
                <TableHead className="hidden md:table-cell">{t("transactions.col.admin")}</TableHead>
                <TableHead className="hidden lg:table-cell">{t("transactions.col.branch")}</TableHead>
                <TableHead className="hidden sm:table-cell">{t("transactions.col.date")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((tx) => (
                <TableRow key={`${tx.type}-${tx.id}`}>
                  <TableCell>
                    {tx.type === "debt" ? (
                      <Badge variant="warning" className="gap-1 whitespace-nowrap">
                        <ArrowDownCircle className="size-3" />
                        {t("transactions.type.debt")}
                      </Badge>
                    ) : (
                      <Badge variant="default" className="gap-1 whitespace-nowrap bg-emerald-500 hover:bg-emerald-600">
                        <ArrowUpCircle className="size-3" />
                        {t("transactions.type.payment")}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{tx.clientName}</div>
                    <div className="text-xs text-muted-foreground">{tx.clientPhone}</div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm">
                    {tx.item}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{formatMoney(tx.amount)}</div>
                    {tx.type === "debt" && tx.status && (
                      <div className="text-xs text-muted-foreground">{tx.status}</div>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm">
                    {tx.adminName}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                    {tx.branch}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground whitespace-nowrap">
                    {formatDate(tx.date)}
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
