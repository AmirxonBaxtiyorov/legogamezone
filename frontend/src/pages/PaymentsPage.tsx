import { useMemo, useState } from "react";
import { Search, Wallet, Printer } from "lucide-react";

import { useFilteredList } from "@/hooks/useApi";
import { useBranchFilterStore } from "@/store/branchFilter";
import { formatMoney, formatDateTime } from "@/lib/format";

import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
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
import type { PaymentItem } from "@/types/api";

const tabs = [
  { id: "this-month", label: "Bu oy" },
  { id: "total-paid", label: "Hammasi" },
];

const methodLabel: Record<string, { label: string; emoji: string }> = {
  cash: { label: "Naqd", emoji: "💵" },
  card: { label: "Karta", emoji: "💳" },
  transfer: { label: "O'tkazma", emoji: "📲" },
};

export function PaymentsPage() {
  const branchId = useBranchFilterStore((s) => s.branchId);
  const [tab, setTab] = useState("this-month");
  const [search, setSearch] = useState("");

  const { data, isLoading } = useFilteredList(tab, branchId);

  const items: PaymentItem[] = useMemo(() => {
    if (data?.kind !== "payments") return [];
    const list = (data.items as PaymentItem[]) ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (p) =>
        (p.client?.toLowerCase().includes(q) ?? false) ||
        (p.clientPhone?.toLowerCase().includes(q) ?? false) ||
        (p.recordedBy?.toLowerCase().includes(q) ?? false),
    );
  }, [data, search]);

  const total = items.reduce((a, p) => a + p.amount, 0);

  const printReceipt = (p: PaymentItem) => {
    const w = window.open("", "_blank", "width=400,height=600");
    if (!w) return;
    w.document.write(`
      <html><head><title>Chek #${p.id}</title>
      <style>
        body { font-family: monospace; padding: 10px; max-width: 280px; margin: 0 auto; }
        .center { text-align: center; }
        hr { border: 1px dashed #999; margin: 8px 0; }
        .row { display: flex; justify-content: space-between; }
      </style></head><body>
        <div class="center">
          <h2>TO'LOV CHEKI</h2>
          <div>${formatDateTime(p.paidDate)}</div>
        </div>
        <hr/>
        <div>Mijoz: <b>${p.client}</b></div>
        <div>Tel: ${p.clientPhone ?? "—"}</div>
        <div>Filial: ${p.branch ?? "—"}</div>
        <div>Xizmat: ${p.debtItem ?? "—"}</div>
        <hr/>
        <div class="row"><span>Summa:</span><b>${formatMoney(p.amount)}</b></div>
        <div class="row"><span>Usul:</span><span>${methodLabel[p.method]?.label ?? p.method}</span></div>
        <div class="row"><span>Qoldiq:</span><span>${formatMoney(p.debtRemaining ?? 0)}</span></div>
        <hr/>
        <div>Yozdi: ${p.recordedBy ?? "—"}</div>
        ${p.notes ? `<div>Izoh: ${p.notes}</div>` : ""}
        <hr/>
        <div class="center">Rahmat!</div>
        <script>window.print();</script>
      </body></html>
    `);
    w.document.close();
  };

  return (
    <div>
      <PageHeader
        title="To'lovlar"
        description={`Jami: ${items.length} ta · ${formatMoney(total)}`}
      />

      <Tabs value={tab} onValueChange={setTab} className="mb-4">
        <TabsList>
          {tabs.map((t) => (
            <TabsTrigger key={t.id} value={t.id}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="mb-4 max-w-sm relative">
        <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Mijoz, telefon, yozgan kishi..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card>
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title="To'lovlar topilmadi"
            description="Tanlangan davrda to'lovlar yo'q"
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sana</TableHead>
                <TableHead>Mijoz</TableHead>
                <TableHead className="hidden md:table-cell">Xizmat</TableHead>
                <TableHead>Summa</TableHead>
                <TableHead>Usul</TableHead>
                <TableHead className="hidden lg:table-cell">Yozdi</TableHead>
                <TableHead className="text-right">Chek</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="text-sm">{formatDateTime(p.paidDate)}</TableCell>
                  <TableCell>
                    <div className="font-medium">{p.client}</div>
                    <div className="text-xs text-muted-foreground">
                      {p.clientPhone} · {p.branch}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm">
                    {p.debtItem || p.debtItemType}
                  </TableCell>
                  <TableCell className="font-semibold text-emerald-600">
                    {formatMoney(p.amount)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {methodLabel[p.method]?.emoji} {methodLabel[p.method]?.label ?? p.method}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                    {p.recordedBy}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="icon"
                      variant="ghost"
                      title="Chek chop etish"
                      onClick={() => printReceipt(p)}
                    >
                      <Printer className="size-4" />
                    </Button>
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
