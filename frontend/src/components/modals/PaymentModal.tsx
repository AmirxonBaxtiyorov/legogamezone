import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { useRecordPayment } from "@/hooks/useApi";
import { formatMoney } from "@/lib/format";
import type { DebtItem } from "@/types/api";

const schema = z.object({
  amount: z.coerce.number().positive("Summa musbat bo'lishi kerak"),
  method: z.enum(["cash", "card", "transfer"]),
  paidDate: z.string().optional(),
  notes: z.string().trim().max(2000).optional().nullable(),
});
type Values = z.infer<typeof schema>;

export function PaymentModal({
  open,
  onOpenChange,
  debt,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  debt: DebtItem | null;
}) {
  const record = useRecordPayment();
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: 0,
      method: "cash",
      paidDate: new Date().toISOString().slice(0, 10),
    },
  });

  useEffect(() => {
    if (open && debt) {
      form.reset({
        amount: debt.remainingAmount,
        method: "cash",
        paidDate: new Date().toISOString().slice(0, 10),
        notes: "",
      });
    }
  }, [open, debt, form]);

  if (!debt) return null;

  const submit = async (v: Values) => {
    if (v.amount > debt.remainingAmount) {
      form.setError("amount", { message: `Qoldiqdan ko'p: maks ${formatMoney(debt.remainingAmount)}` });
      return;
    }
    await record.mutateAsync({
      debtId: debt.id,
      amount: v.amount,
      method: v.method,
      paidDate: v.paidDate,
      notes: v.notes ?? null,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>To'lov yozish</DialogTitle>
          <DialogDescription>
            {debt.client} — {debt.itemDetails || debt.itemType} ·{" "}
            <span className="font-medium text-orange-500">
              Qoldiq: {formatMoney(debt.remainingAmount)}
            </span>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
          <div className="space-y-2">
            <Label>To'lov summasi (so'm)</Label>
            <Input
              type="number"
              min={0}
              max={debt.remainingAmount}
              autoFocus
              {...form.register("amount")}
            />
            {form.formState.errors.amount && (
              <p className="text-xs text-destructive">{form.formState.errors.amount.message}</p>
            )}
            <div className="flex gap-2 text-xs">
              <button
                type="button"
                className="text-primary hover:underline"
                onClick={() => form.setValue("amount", debt.remainingAmount)}
              >
                Qoldiq: {formatMoney(debt.remainingAmount)}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>To'lov usuli</Label>
            <Select
              value={form.watch("method")}
              onValueChange={(v) => form.setValue("method", v as Values["method"])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">💵 Naqd</SelectItem>
                <SelectItem value="card">💳 Karta</SelectItem>
                <SelectItem value="transfer">📲 O'tkazma</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Sana</Label>
            <Input type="date" {...form.register("paidDate")} />
          </div>
          <div className="space-y-2">
            <Label>Eslatma</Label>
            <Textarea rows={2} {...form.register("notes")} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Bekor qilish
            </Button>
            <Button type="submit" disabled={record.isPending}>
              To'lov qabul qilish
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
