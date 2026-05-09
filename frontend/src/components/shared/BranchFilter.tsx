// Owner uchun filial filteri (admin uchun ko'rinmaydi).

import { useBranchFilterStore } from "@/store/branchFilter";
import { useAuthStore } from "@/store/auth";
import { useBranches } from "@/hooks/useApi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function BranchFilter() {
  const role = useAuthStore((s) => s.user?.role);
  const branchId = useBranchFilterStore((s) => s.branchId);
  const setBranchId = useBranchFilterStore((s) => s.setBranchId);
  const { data: branches } = useBranches();

  if (role !== "owner") return null;

  return (
    <Select
      value={branchId == null ? "all" : String(branchId)}
      onValueChange={(v) => setBranchId(v === "all" ? null : Number(v))}
    >
      <SelectTrigger className="w-[200px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Barcha filiallar</SelectItem>
        {branches?.map((b) => (
          <SelectItem key={b.id} value={String(b.id)}>
            {b.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
