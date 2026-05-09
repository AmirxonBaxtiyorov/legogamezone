import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth";

export function OwnerOnly({ children }: { children: React.ReactNode }) {
  const role = useAuthStore((s) => s.user?.role);
  if (role !== "owner") {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}
