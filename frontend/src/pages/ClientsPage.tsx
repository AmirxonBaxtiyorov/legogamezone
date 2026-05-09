import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  Pencil,
  Ban,
  ShieldOff,
  Trash2,
  AlertTriangle,
  Users,
} from "lucide-react";

import { useClientsAll, useSoftDeleteClient } from "@/hooks/useApi";
import { useBranchFilterStore } from "@/store/branchFilter";
import { formatMoney, formatDate } from "@/lib/format";

import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ClientFormModal } from "@/components/modals/ClientFormModal";
import { BlacklistModal } from "@/components/modals/BlacklistModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmpty,
} from "@/components/ui/table";
import type { ClientLite } from "@/types/api";

export function ClientsPage() {
  const branchId = useBranchFilterStore((s) => s.branchId);
  const { data, isLoading } = useClientsAll(branchId);
  const softDelete = useSoftDeleteClient();

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ClientLite | null>(null);
  const [blacklist, setBlacklist] = useState<ClientLite | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const items = useMemo(() => {
    const list = data?.items ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        (c.notes?.toLowerCase().includes(q) ?? false),
    );
  }, [data, search]);

  return (
    <div>
      <PageHeader
        title="Mijozlar"
        description={
          data
            ? `Jami: ${data.total} ta mijoz · Qoldiq: ${formatMoney(data.totalRemaining)}`
            : "Mijozlar ro'yxati"
        }
        actions={
          <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
            <Plus className="size-4" /> Yangi mijoz
          </Button>
        }
      />

      <div className="flex gap-2 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Ism, telefon, eslatma..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Card>
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={Users}
            title={search ? "Topilmadi" : "Mijozlar yo'q"}
            description={
              search ? "Boshqa kalit so'z bilan urinib ko'ring" : "Yangi mijoz qo'shing"
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ism</TableHead>
                <TableHead>Telefon</TableHead>
                <TableHead className="hidden md:table-cell">Filial</TableHead>
                <TableHead>Qarzlar</TableHead>
                <TableHead>Qoldiq</TableHead>
                <TableHead className="hidden lg:table-cell">Yaratildi</TableHead>
                <TableHead className="text-right">Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((c) => (
                <TableRow key={c.id} className={c.isBlacklisted ? "bg-destructive/5" : ""}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/clients/${c.id}`}
                        className="font-medium hover:underline"
                        onClick={(e) => e.preventDefault()}
                        title={c.notes ?? undefined}
                      >
                        {c.name}
                      </Link>
                      {c.isBlacklisted && (
                        <Badge variant="destructive" className="gap-1">
                          <Ban className="size-3" /> Qora ro'yxat
                        </Badge>
                      )}
                      {c.hasOverdue && (
                        <Badge variant="warning" className="gap-1">
                          <AlertTriangle className="size-3" /> Kechikkan
                        </Badge>
                      )}
                    </div>
                    {c.notes && (
                      <div className="text-xs text-muted-foreground mt-1 truncate max-w-[300px]">
                        {c.notes}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <a href={`tel:${c.phone}`} className="text-sm hover:underline">
                      {c.phone}
                    </a>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {c.branch}
                  </TableCell>
                  <TableCell className="text-sm">{c.debtsCount ?? 0}</TableCell>
                  <TableCell className={c.totalRemaining ? "font-medium text-orange-500" : ""}>
                    {formatMoney(c.totalRemaining ?? 0)}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                    {formatDate((c as ClientLite & { createdAt?: string }).createdAt ?? null)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        title="Tahrirlash"
                        onClick={() => { setEditing(c); setFormOpen(true); }}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        title={c.isBlacklisted ? "Qora ro'yxatdan chiqarish" : "Qora ro'yxatga"}
                        onClick={() => setBlacklist(c)}
                      >
                        {c.isBlacklisted ? (
                          <ShieldOff className="size-4 text-destructive" />
                        ) : (
                          <Ban className="size-4" />
                        )}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        title="Arxivga"
                        onClick={() => setDeleteId(c.id)}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {items.length === 0 && <TableEmpty>Hech narsa topilmadi</TableEmpty>}
            </TableBody>
          </Table>
        )}
      </Card>

      <ClientFormModal open={formOpen} onOpenChange={setFormOpen} client={editing} />
      <BlacklistModal open={!!blacklist} onOpenChange={(o) => !o && setBlacklist(null)} client={blacklist} />
      <ConfirmDialog
        open={deleteId != null}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Mijozni arxivga ko'chirasizmi?"
        description="Mijoz ko'rinishdan olinadi (soft-delete). Owner istalgan vaqtda qaytarishi mumkin."
        destructive
        onConfirm={async () => {
          if (deleteId) await softDelete.mutateAsync(deleteId);
          setDeleteId(null);
        }}
      />
    </div>
  );
}
