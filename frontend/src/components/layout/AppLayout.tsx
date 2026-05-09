import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Wallet,
  FileText,
  History,
  Settings,
  Building2,
  ShieldCheck,
  LogOut,
  Moon,
  Sun,
  Laptop,
  Menu,
  X,
} from "lucide-react";

import { useAuthStore } from "@/store/auth";
import { useTheme } from "@/providers/ThemeProvider";
import { useAppSettings, AppBrandLogo } from "@/providers/AppSettingsProvider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { GlobalSearch } from "@/components/shared/GlobalSearch";
import { NotificationBell } from "@/components/shared/NotificationBell";

const navItems = [
  { to: "/dashboard", label: "Boshqaruv paneli", icon: LayoutDashboard },
  { to: "/clients", label: "Mijozlar", icon: Users },
  { to: "/debts", label: "Qarzlar", icon: CreditCard },
  { to: "/payments", label: "To'lovlar", icon: Wallet },
  { to: "/reports", label: "Hisobotlar", icon: FileText, ownerOnly: true },
  { to: "/audit", label: "Audit log", icon: History, ownerOnly: true },
  { to: "/branches", label: "Filiallar", icon: Building2, ownerOnly: true },
  { to: "/admins", label: "Adminlar", icon: ShieldCheck, ownerOnly: true },
  { to: "/settings", label: "Sozlamalar", icon: Settings, ownerOnly: true },
];

export function AppLayout() {
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const branding = useAppSettings();
  const navigate = useNavigate();
  const isOwner = user?.role === "owner";
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await api.post("/logout").catch(() => {});
    } finally {
      logout();
      navigate("/login", { replace: true });
      toast.success("Tizimdan chiqdingiz");
    }
  };

  const cycleTheme = () => {
    const next = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
    setTheme(next);
  };
  const ThemeIcon = theme === "light" ? Sun : theme === "dark" ? Moon : Laptop;

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between gap-2 px-6 h-16 border-b">
        <div className="flex items-center gap-2 min-w-0">
          <AppBrandLogo size={32} />
          <div className="font-semibold truncate" title={branding.systemName}>
            {branding.systemName}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden shrink-0"
          onClick={() => setMobileOpen(false)}
        >
          <X className="size-4" />
        </Button>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((it) => {
          if (it.ownerOnly && !isOwner) return null;
          const Icon = it.icon;
          return (
            <NavLink
              key={it.to}
              to={it.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )
              }
            >
              <Icon className="size-4" />
              {it.label}
            </NavLink>
          );
        })}
      </nav>
      <div className="p-4 border-t space-y-2">
        <div className="text-xs">
          <div className="font-medium">{user?.fullName}</div>
          <div className="text-muted-foreground">
            {isOwner ? "Tarmoq egasi" : `Admin · ${user?.branchName ?? "—"}`}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={cycleTheme} className="flex-1" title="Tema">
            <ThemeIcon className="size-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleLogout} className="flex-1">
            <LogOut className="size-4" />
            <span className="hidden sm:inline">Chiqish</span>
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-card sticky top-0 h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="md:hidden fixed left-0 top-0 bottom-0 w-72 max-w-[85%] z-50 flex flex-col bg-card border-r animate-in slide-in-from-left">
            {sidebarContent}
          </aside>
        </>
      )}

      {/* Main */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center gap-3 px-4 md:px-6 h-14 border-b bg-card/80 backdrop-blur">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="size-5" />
          </Button>
          <div className="md:hidden flex items-center gap-2 mr-2">
            <AppBrandLogo size={28} />
            <span className="font-semibold text-sm truncate max-w-[100px]">
              {branding.systemName}
            </span>
          </div>
          <div className="flex-1 flex justify-center md:justify-start">
            <GlobalSearch />
          </div>
          <NotificationBell />
          <Button
            variant="ghost"
            size="icon"
            onClick={cycleTheme}
            className="hidden md:inline-flex"
            title="Tema"
          >
            <ThemeIcon className="size-4" />
          </Button>
        </header>
        <div className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
