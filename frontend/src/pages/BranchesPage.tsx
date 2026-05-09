import { useState } from "react";
import { Plus, Pencil, Trash2, Building2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  useBranches,
  useCreateBranch,
  useUpdateBranch,
  useDeleteBranch,
} from "@/hooks/useApi";
import { formatMoney } from "@/lib/format";

import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { BranchFull } from "@/types/api";

const schema = z.object({
  name: z.string().trim().min(1),
  address: z.string().trim().max(300).optional().nullable(),
  phone: z.string().trim().max(32).optional().nullable(),
});
type Values = z.infer<typeof schema>;

export function BranchesPage() {
  const { data: branches, isLoading } = useBranches();
  const createMut = useCreateBranch();
  const updateMut = useUpdateBranch();
  const deleteMut = useDeleteBranch();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<BranchFull | null>(null);
  const [deleting, setDeleting] = useState<BranchFull | null>(null);

  const form = useForm<Values>({ resolver: zodResolver(schema) });

  const openCreate = () => {
    setEditing(null);
    form.reset({ name: "", address: "", phone: "" });
    setFormOpen(true);
  };
  const openEdit = (b: BranchFull) => {
    setEditing(b);
    form.reset({ name: b.name, address: b.address ?? "", phone: b.phone ?? "" });
    setFormOpen(true);
  };

  const onSubmit = async (v: Values) => {
    if (editing) {
      await updateMut.mutateAsync({ id: editing.id, ...v });
    } else {
      await createMut.mutateAsync(v);
    }
    setFormOpen(false);
  };

  return (
    <div>
      <PageHeader
        title="Filiallar"
        description="Game zone joylashuvlari"
        showBranchFilter={false}
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" /> Yangi filial
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : !branches || branches.length === 0 ? (
        <EmptyState icon={Building2} title="Filial yo'q" />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {branches.map((b) => (
            <Card key={b.id}>
              <CardHeader className="flex-row justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="size-4" /> {b.name}
                  {!b.isActive && <Badge variant="secondary">Faol emas</Badge>}
                </CardTitle>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(b)} title="Tahrirlash">
                    <Pencil className="size-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => setDeleting(b)} title="O'chirish">
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                {b.address && <div className="text-muted-foreground">{b.address}</div>}
                {b.phone && (
                  <div>
                    <a href={`tel:${b.phone}`} className="hover:underline">
                      {b.phone}
                    </a>
                  </div>
                )}
                <div className="border-t pt-2 mt-2 grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <div className="text-muted-foreground">Mijozlar</div>
                    <div className="font-semibold">{b.clientsCount}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Qarzlar</div>
                    <div className="font-semibold">{b.debtsCount}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Qoldiq</div>
                    <div className="font-semibold text-orange-500">{formatMoney(b.totalRemaining ?? 0)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Filialni tahrirlash" : "Yangi filial"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Nomi</Label>
              <Input autoFocus {...form.register("name")} />
              {form.formState.errors.name && (
                <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Manzil</Label>
              <Input {...form.register("address")} />
            </div>
            <div className="space-y-2">
              <Label>Telefon</Label>
              <Input placeholder="+998 71 ..." {...form.register("phone")} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Bekor qilish
              </Button>
              <Button type="submit">{editing ? "Saqlash" : "Yaratish"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`${deleting?.name ?? ""} filialini o'chirasizmi?`}
        description="Faqat bo'sh filiallar o'chiriladi. Mijozlar/qarzlar bo'lsa, force orqali o'chirish kerak."
        destructive
        onConfirm={async () => {
          if (deleting) await deleteMut.mutateAsync({ id: deleting.id });
          setDeleting(null);
        }}
      />
    </div>
  );
}
