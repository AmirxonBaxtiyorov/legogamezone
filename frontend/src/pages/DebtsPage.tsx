import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  Wallet,
  Pencil,
  Ban,
  Trash2,
  CreditCard,
} from "lucide-react";

import { useFilteredList, useSoftDeleteDebt, useHardDeleteDebt } from "@/hooks/useApi";
import { useBranchFilterStore } from "@/store/branchFilter";
import { useAuthStore } from "@/store/auth";
import { formatMoney, formatDate, isUnknownDue } from "@/lib/format";

import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DebtFormModal } from "@/components/modals/DebtFormModal";
import { PaymentModal } from "@/components/modals/PaymentModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import type { DebtItem, DebtStatus } from "@/types/api";

const filters: Array<{ id: string; label: string }> = [
  { id: "remaining", label: "Qoldiq qarzli" },
  { id: "status:active", label: "Faol" },
  { id: "status:partial", label: "Qisman" },
  { id: "status:overdue", label: "Kechikkan" },
  { id: "status:paid", label: "To'liq to'langan" },
  { id: "status:cancelled", label: "Bekor qilingan" },
  { id: "due-today", label: "Bugun muddat" },
  { id: "total-debt", label: "Hammasi" },
];

export function DebtsPage() {
  const branchId = useBranchFilterStore((s) => s.branchId);
  const role = useAuthStore((s) => s.user?.role);
  const [tab, setTab] = useState("remaining");
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [paymentDebt, setPaymentDebt] = useState<DebtItem | null>(null);
  const [softDeleteId, setSoftDeleteId] = useState<number | null>(null);
  const [hardDeleteId, setHardDeleteId] = useState<number | null>(null);

  const { data, isLoading } = useFilteredList(tab, branchId);
  const softDelete = useSoftDeleteDebt();
  const hardDelete = useHardDeleteDebt();

  const items: DebtItem[] = useMemo(() => {
    if (data?.kind !== "debts") return [];
    const list = (data.items as DebtItem[]) ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (d) =>
        d.client.toLowerCase().includes(q) ||
        d.clientPhone.toLowerCase().includes(q) ||
        (d.itemDetails?.toLowerCase().includes(q) ?? false) ||
        (d.notes?.toLowerCase().includes(q) ?? false),
    );
  }, [data, search]);

  return (
    <div>
      <PageHeader
        title="Qarzlar"
        description="Barcha qarzlar — filtr, tahrirlash, to'lov yozish"
        actions={
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="size-4" /> Yangi qarz
          </Button>
        }
      />

      <Tabs value={tab} onValueChange={setTab} className="mb-4">
        <TabsList className="flex flex-wrap h-auto">
          {filters.map((f) => (
            <TabsTrigger key={f.id} value={f.id}>
              {f.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="mb-4 max-w-sm relative">
        <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Mijoz ismi, telefon, izoh..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card>
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="Bu filtrda qarz yo'q"
            description={search ? "Qidiruv natijasi bo'sh" : "Yangi qarz qo'shing"}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mijoz</TableHead>
                <TableHead className="hidden md:table-cell">Xizmat</TableHead>
                <TableHead>Summa</TableHead>
                <TableHead>Qoldiq</TableHead>
                <TableHead>Muddat</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>
                    <div className="font-medium">{d.client}</div>
                    <div className="text-xs text-muted-foreground">
                      {d.clientPhone} · {d.branch}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div>{d.itemDetails || itemTypeLabel(d.itemType)}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(d.borrowedDate)}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatMoney(d.amount)}
                    {d.paidAmount > 0 && (
                      <div className="text-xs text-emerald-600">
                        +{formatMoney(d.paidAmount)} to'langan
                      </div>
                    )}
                  </TableCell>
                  <TableCell className={d.remainingAmount > 0 ? "font-semibold text-orange-500" : "text-emerald-600"}>
                    {formatMoney(d.remainingAmount)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {isUnknownDue(d.dueDate) ? "—" : formatDate(d.dueDate)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={d.status as DebtStatus} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {d.status !== "paid" && d.status !== "cancelled" && (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => setPaymentDebt(d)}
                          title="To'lov qabul qilish"
                        >
                          <Wallet className="size-4" />
                          <span className="hidden sm:inline">To'lov</span>
                        </Button>
                      )}
                      <Button size="icon" variant="ghost" title="Tahrirlash" disabled>
                        <Pencil className="size-4" />
                      </Button>
                      {role === "owner" && d.status !== "cancelled" && (
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Bekor qilish"
                          onClick={() => setSoftDeleteId(d.id)}
                        >
                          <Ban className="size-4" />
                        </Button>
                      )}
                      {role === "owner" && (
                        <Button
                          size="icon"
                          variant="ghost"
                          title="O'chirish"
                          onClick={() => setHardDeleteId(d.id)}
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <DebtFormModal open={formOpen} onOpenChange={setFormOpen} />
      <PaymentModal
        open={!!paymentDebt}
        onOpenChange={(o) => !o && setPaymentDebt(null)}
        debt={paymentDebt}
      />
      <ConfirmDialog
        open={softDeleteId != null}
        onOpenChange={(o) => !o && setSoftDeleteId(null)}
        title="Qarzni bekor qilasizmi?"
        description="Qarz status «Bekor qilingan» ga o'zgaradi. Owner istaganda qaytaradi."
        destructive
        onConfirm={async () => {
          if (softDeleteId) await softDelete.mutateAsync(softDeleteId);
          setSoftDeleteId(null);
        }}
      />
      <ConfirmDialog
        open={hardDeleteId != null}
        onOpenChange={(o) => !o && setHardDeleteId(null)}
        title="Butunlay o'chirasizmi?"
        description="Bu amal qaytmaydi. To'lovlar va audit log ham olib tashlanadi."
        destructive
        confirmText="Ha, o'chirish"
        onConfirm={async () => {
          if (hardDeleteId) await hardDelete.mutateAsync(hardDeleteId);
          setHardDeleteId(null);
        }}
      />
    </div>
  );
}

function itemTypeLabel(t: string): string {
  const m: Record<string, string> = {
    playstation: "PlayStation",
    computer: "Kompyuter",
    billiard: "Bilyard",
    other: "Boshqa",
  };
  return m[t] ?? t;
}
