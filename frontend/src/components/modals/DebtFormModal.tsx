import { useEffect, useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/store/auth";
import {
  useBranches,
  useClientsAll,
  useCreateClient,
  useCreateDebt,
} from "@/hooks/useApi";

const schema = z.object({
  itemType: z.enum(["playstation", "computer", "billiard", "other"]),
  itemDetails: z.string().trim().max(500).optional().nullable(),
  amount: z.coerce.number().positive("Summa musbat bo'lishi kerak"),
  borrowedDate: z.string().optional(),
  dueDate: z.string().optional(),
  dueDateUnknown: z.boolean().optional(),
  notes: z.string().trim().max(2000).optional().nullable(),
  // Mavjud mijoz
  clientId: z.coerce.number().int().positive().optional(),
  // Yangi mijoz
  newName: z.string().trim().optional(),
  newPhone: z.string().trim().optional(),
  newNotes: z.string().trim().optional().nullable(),
  branchId: z.coerce.number().int().positive().optional(),
});
type Values = z.infer<typeof schema>;

const itemTypes = [
  { value: "playstation", label: "🎮 PlayStation" },
  { value: "computer", label: "💻 Kompyuter" },
  { value: "billiard", label: "🎱 Bilyard" },
  { value: "other", label: "🔧 Boshqa" },
] as const;

export function DebtFormModal({
  open,
  onOpenChange,
  defaultClientId,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  defaultClientId?: number;
}) {
  const role = useAuthStore((s) => s.user?.role);
  const userBranchId = useAuthStore((s) => s.user?.branchId);
  const { data: branches } = useBranches();
  const { data: clientsResp } = useClientsAll(null);
  const create = useCreateDebt();
  const createClient = useCreateClient();

  const [tab, setTab] = useState<"existing" | "new">(defaultClientId ? "existing" : "existing");

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      itemType: "playstation",
      amount: 0,
      borrowedDate: new Date().toISOString().slice(0, 10),
    },
  });

  useEffect(() => {
    if (open) {
      const today = new Date().toISOString().slice(0, 10);
      const inWeek = new Date(Date.now() + 7 * 86400_000).toISOString().slice(0, 10);
      form.reset({
        itemType: "playstation",
        itemDetails: "",
        amount: 0,
        borrowedDate: today,
        dueDate: inWeek,
        dueDateUnknown: false,
        notes: "",
        clientId: defaultClientId,
        newName: "",
        newPhone: "",
        newNotes: "",
        branchId: role === "admin" ? userBranchId ?? undefined : undefined,
      });
      setTab(defaultClientId ? "existing" : "existing");
    }
  }, [open, defaultClientId, role, userBranchId, form]);

  const onSubmit = async (v: Values) => {
    let cid = v.clientId;
    if (tab === "new") {
      if (!v.newName || !v.newPhone) {
        form.setError("newName", { message: "Ism va telefon majburiy" });
        return;
      }
      // Avval mijoz yaratamiz, keyin qarz
      const created = await createClient.mutateAsync({
        name: v.newName,
        phone: v.newPhone,
        notes: v.newNotes ?? null,
        branchId: v.branchId,
      });
      cid = (created as { id: number }).id;
    }
    if (!cid) {
      form.setError("clientId", { message: "Mijoz tanlanmagan" });
      return;
    }
    await create.mutateAsync({
      clientId: cid,
      itemType: v.itemType,
      itemDetails: v.itemDetails ?? null,
      amount: v.amount,
      borrowedDate: v.borrowedDate,
      dueDate: v.dueDateUnknown ? undefined : v.dueDate,
      dueDateUnknown: v.dueDateUnknown,
      notes: v.notes ?? null,
    });
    onOpenChange(false);
  };

  const submitting = form.formState.isSubmitting;
  const dueUnknown = form.watch("dueDateUnknown");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Yangi qarz qo'shish</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Tabs value={tab} onValueChange={(v) => setTab(v as "existing" | "new")}>
            <TabsList className="w-full">
              <TabsTrigger value="existing" className="flex-1">Mavjud mijoz</TabsTrigger>
              <TabsTrigger value="new" className="flex-1">Yangi mijoz</TabsTrigger>
            </TabsList>

            <TabsContent value="existing">
              <div className="space-y-2">
                <Label>Mijozni tanlang</Label>
                <Select
                  value={form.watch("clientId") ? String(form.watch("clientId")) : ""}
                  onValueChange={(v) => form.setValue("clientId", Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Mijozni tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientsResp?.items
                      .filter((c) => !c.isDeleted && !c.isBlacklisted)
                      .map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.name} — {c.phone} ({c.branch})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.clientId && (
                  <p className="text-xs text-destructive">{form.formState.errors.clientId.message}</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="new">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Ism familiya</Label>
                  <Input {...form.register("newName")} />
                </div>
                <div className="space-y-2">
                  <Label>Telefon</Label>
                  <Input placeholder="+998901234567" {...form.register("newPhone")} />
                </div>
                {role === "owner" && (
                  <div className="space-y-2 md:col-span-2">
                    <Label>Filial</Label>
                    <Select
                      value={form.watch("branchId") ? String(form.watch("branchId")) : ""}
                      onValueChange={(v) => form.setValue("branchId", Number(v))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Filial tanlang" />
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
                {form.formState.errors.newName && (
                  <p className="text-xs text-destructive md:col-span-2">
                    {form.formState.errors.newName.message}
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Xizmat turi</Label>
              <Select
                value={form.watch("itemType")}
                onValueChange={(v) => form.setValue("itemType", v as Values["itemType"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {itemTypes.map((it) => (
                    <SelectItem key={it.value} value={it.value}>
                      {it.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tafsilot (ixtiyoriy)</Label>
              <Input placeholder="PS5 — 3 soat" {...form.register("itemDetails")} />
            </div>
            <div className="space-y-2">
              <Label>Summa (so'm)</Label>
              <Input type="number" min={0} {...form.register("amount")} />
              {form.formState.errors.amount && (
                <p className="text-xs text-destructive">{form.formState.errors.amount.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Olingan sana</Label>
              <Input type="date" {...form.register("borrowedDate")} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center justify-between">
                <Label>Qaytarish muddati</Label>
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    {...form.register("dueDateUnknown")}
                    className="size-4"
                  />
                  Aniq sana yo'q
                </label>
              </div>
              <Input type="date" disabled={!!dueUnknown} {...form.register("dueDate")} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Eslatma</Label>
              <Textarea rows={2} {...form.register("notes")} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              Bekor qilish
            </Button>
            <Button type="submit" disabled={submitting}>
              Qarz qo'shish
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
