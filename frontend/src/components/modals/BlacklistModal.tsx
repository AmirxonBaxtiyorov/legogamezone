import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToggleBlacklist } from "@/hooks/useApi";
import type { ClientLite } from "@/types/api";

export function BlacklistModal({
  open,
  onOpenChange,
  client,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  client: ClientLite | null;
}) {
  const [reason, setReason] = useState("");
  const toggle = useToggleBlacklist();

  useEffect(() => {
    if (open) setReason(client?.blacklistReason ?? "");
  }, [open, client]);

  if (!client) return null;
  const isCurrentlyBlacklisted = client.isBlacklisted;

  const submit = async () => {
    await toggle.mutateAsync({
      id: client.id,
      isBlacklisted: !isCurrentlyBlacklisted,
      reason: !isCurrentlyBlacklisted ? reason : null,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isCurrentlyBlacklisted ? "Qora ro'yxatdan chiqarish" : "Qora ro'yxatga qo'shish"}
          </DialogTitle>
          <DialogDescription>{client.name} — {client.phone}</DialogDescription>
        </DialogHeader>
        {!isCurrentlyBlacklisted && (
          <div className="space-y-2">
            <Label>Sabab</Label>
            <Textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nima sababli qora ro'yxatga qo'shilmoqda?"
            />
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={toggle.isPending}>
            Bekor qilish
          </Button>
          <Button
            variant={isCurrentlyBlacklisted ? "default" : "destructive"}
            onClick={submit}
            disabled={toggle.isPending}
          >
            {isCurrentlyBlacklisted ? "Chiqarish" : "Qora ro'yxatga"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
