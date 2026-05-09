import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "@/store/auth";
import { useBranches, useCreateClient, useUpdateClient } from "@/hooks/useApi";
import type { ClientLite } from "@/types/api";

const schema = z.object({
  name: z.string().trim().min(1, "Ism majburiy"),
  phone: z.string().trim().min(4, "Telefon majburiy"),
  branchId: z.coerce.number().int().positive().optional(),
  notes: z.string().trim().max(2000).optional().nullable(),
});
type Values = z.infer<typeof schema>;

export function ClientFormModal({
  open,
  onOpenChange,
  client,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  client?: ClientLite | null;
}) {
  const role = useAuthStore((s) => s.user?.role);
  const userBranchId = useAuthStore((s) => s.user?.branchId);
  const { data: branches } = useBranches();

  const create = useCreateClient();
  const update = useUpdateClient();

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", phone: "", notes: "" },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: client?.name ?? "",
        phone: client?.phone ?? "",
        notes: client?.notes ?? "",
        branchId:
          client?.branchId ?? (role === "admin" ? userBranchId ?? undefined : undefined),
      });
    }
  }, [open, client, role, userBranchId, form]);

  const onSubmit = async (v: Values) => {
    if (client) {
      await update.mutateAsync({ id: client.id, name: v.name, phone: v.phone, notes: v.notes });
    } else {
      await create.mutateAsync({
        name: v.name,
        phone: v.phone,
        notes: v.notes,
        branchId: v.branchId,
      });
    }
    onOpenChange(false);
  };

  const isEdit = !!client;
  const submitting = form.formState.isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Mijozni tahrirlash" : "Yangi mijoz"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Ism familiya</Label>
            <Input id="name" autoFocus {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefon</Label>
            <Input id="phone" placeholder="+998901234567" {...form.register("phone")} />
            {form.formState.errors.phone && (
              <p className="text-xs text-destructive">{form.formState.errors.phone.message}</p>
            )}
          </div>
          {role === "owner" && !isEdit && (
            <div className="space-y-2">
              <Label>Filial</Label>
              <Select
                value={form.watch("branchId") ? String(form.watch("branchId")) : ""}
                onValueChange={(v) => form.setValue("branchId", Number(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {branches?.map((b) => (
                    <SelectItem key={b.id} value={String(b.id)}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="notes">Eslatma</Label>
            <Textarea id="notes" rows={3} {...form.register("notes")} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              Bekor qilish
            </Button>
            <Button type="submit" disabled={submitting}>
              {isEdit ? "Saqlash" : "Qo'shish"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
