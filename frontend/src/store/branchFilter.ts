// Owner uchun joriy tanlangan filial (yoki barchasi). Admin uchun ahamiyatsiz.
import { create } from "zustand";

interface BranchFilterState {
  branchId: number | null;
  setBranchId: (id: number | null) => void;
}

export const useBranchFilterStore = create<BranchFilterState>((set) => ({
  branchId: null,
  setBranchId: (id) => set({ branchId: id }),
}));
