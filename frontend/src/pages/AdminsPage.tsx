import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  ShieldCheck,
  KeyRound,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  useAdmins,
  useBranches,
  useCreateAdmin,
  useUpdateAdmin,
  useDeleteAdmin,
  useResetAdminPassword,
} from "@/hooks/useApi";
import { formatDateTime } from "@/lib/format";

import { PageHeader } from "@/components/shared/PageHeader";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card } from "@/components/ui/card";
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
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import type { Admin } from "@/types/api";

const createSchema = z.object({
  username: z.string().trim().min(3),
  password: z.string().min(6, "Kamida 6 belgi"),
  fullName: z.string().trim().min(1),
  branchId: z.coerce.number().int().positive(),
  role: z.enum(["admin", "owner"]).default("admin"),
});

const updateSchema = z.object({
  fullName: z.string().trim().min(1),
  branchId: z.coerce.number().int().positive().optional(),
  isActive: z.boolean().optional(),
});

const resetSchema = z.object({
  newPassword: z.string().min(6, "Kamida 6 belgi"),
});

export function AdminsPage() {
  const { data: admins, isLoading } = useAdmins();
  const { data: branches } = useBranches();

  const createMut = useCreateAdmin();
  const updateMut = useUpdateAdmin();
  const deleteMut = useDeleteAdmin();
  const resetMut = useResetAdminPassword();

  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Admin | null>(null);
  const [resetting, setResetting] = useState<Admin | null>(null);
  const [deleting, setDeleting] = useState<Admin | null>(null);

  const createForm = useForm<z.infer<typeof createSchema>>({ resolver: zodResolver(createSchema) });
  const editForm = useForm<z.infer<typeof updateSchema>>({ resolver: zodResolver(updateSchema) });
  const resetForm = useForm<z.infer<typeof resetSchema>>({ resolver: zodResolver(resetSchema) });

  const openCreate = () => {
    createForm.reset({ role: "admin" });
    setCreateOpen(true);
  };
  const openEdit = (a: Admin) => {
    setEditing(a);
    editForm.reset({
      fullName: a.fullName,
      branchId: a.branchId ?? undefined,
      isActive: a.isActive,
    });
  };

  const onCreate = async (v: z.infer<typeof createSchema>) => {
    await createMut.mutateAsync(v);
    setCreateOpen(false);
  };
  const onEdit = async (v: z.infer<typeof updateSchema>) => {
    if (!editing) return;
    await updateMut.mutateAsync({ id: editing.id, ...v });
    setEditing(null);
  };
  const onReset = async (v: z.infer<typeof resetSchema>) => {
    if (!resetting) return;
    await resetMut.mutateAsync({ id: resetting.id, newPassword: v.newPassword });
    setResetting(null);
  };

  return (
    <div>
      <PageHeader
        title="Adminlar"
        description="Tizimga kira oladigan foydalanuvchilar"
        showBranchFilter={false}
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" /> Yangi admin
          </Button>
        }
      />

      <Card>
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : !admins || admins.length === 0 ? (
          <EmptyState icon={ShieldCheck} title="Adminlar yo'q" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Login</TableHead>
                <TableHead>Ism</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead className="hidden md:table-cell">Filial</TableHead>
                <TableHead className="hidden lg:table-cell">Oxirgi kirish</TableHead>
                <TableHead className="text-right">Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-mono text-sm">{a.username}</TableCell>
                  <TableCell>
                    {a.fullName}
                    {!a.isActive && (
                      <Badge variant="secondary" className="ml-2">
                        Faol emas
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={a.role === "owner" ? "default" : "outline"}>{a.role}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {a.branchName ?? "—"}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                    {a.lastLoginAt ? formatDateTime(a.lastLoginAt) : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(a)} title="Tahrirlash">
                        <Pencil className="size-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => setResetting(a)} title="Parol reset">
                        <KeyRound className="size-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => setDeleting(a)} title="O'chirish">
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Create */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yangi admin</DialogTitle>
          </DialogHeader>
          <form onSubmit={createForm.handleSubmit(onCreate)} className="space-y-3">
            <div className="space-y-2">
              <Label>Login</Label>
              <Input {...createForm.register("username")} />
            </div>
            <div className="space-y-2">
              <Label>Parol</Label>
              <Input type="password" {...createForm.register("password")} />
            </div>
            <div className="space-y-2">
              <Label>Ism familiya</Label>
              <Input {...createForm.register("fullName")} />
            </div>
            <div className="space-y-2">
              <Label>Filial</Label>
              <Select
                value={createForm.watch("branchId") ? String(createForm.watch("branchId")) : ""}
                onValueChange={(v) => createForm.setValue("branchId", Number(v))}
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
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Bekor qilish
              </Button>
              <Button type="submit">Yaratish</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing?.fullName} — tahrirlash</DialogTitle>
          </DialogHeader>
          <form onSubmit={editForm.handleSubmit(onEdit)} className="space-y-3">
            <div className="space-y-2">
              <Label>Ism familiya</Label>
              <Input {...editForm.register("fullName")} />
            </div>
            <div className="space-y-2">
              <Label>Filial</Label>
              <Select
                value={editForm.watch("branchId") ? String(editForm.watch("branchId")) : ""}
                onValueChange={(v) => editForm.setValue("branchId", Number(v))}
              >
                <SelectTrigger>
                  <SelectValue />
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
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={editForm.watch("isActive") ?? false}
                onChange={(e) => editForm.setValue("isActive", e.target.checked)}
              />
              Faol
            </label>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                Bekor qilish
              </Button>
              <Button type="submit">Saqlash</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reset */}
      <Dialog open={!!resetting} onOpenChange={(o) => !o && setResetting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{resetting?.fullName} — parol reset</DialogTitle>
            <DialogDescription>Yangi parol berilgach, eski parol ishlamaydi.</DialogDescription>
          </DialogHeader>
          <form onSubmit={resetForm.handleSubmit(onReset)} className="space-y-3">
            <div className="space-y-2">
              <Label>Yangi parol</Label>
              <Input type="password" {...resetForm.register("newPassword")} />
              {resetForm.formState.errors.newPassword && (
                <p className="text-xs text-destructive">
                  {resetForm.formState.errors.newPassword.message}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setResetting(null)}>
                Bekor qilish
              </Button>
              <Button type="submit">Parolni o'rnatish</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`${deleting?.fullName ?? ""} ni o'chirasizmi?`}
        description="Owner'lar va aktiv adminlar o'chirilmaydi (avval inactive qiling)."
        destructive
        onConfirm={async () => {
          if (deleting) await deleteMut.mutateAsync(deleting.id);
          setDeleting(null);
        }}
      />
    </div>
  );
}
