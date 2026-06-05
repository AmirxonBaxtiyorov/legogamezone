import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { refreshDebtorsCache } from "@/lib/offline-cache";
import {
  CalendarClock,
  LayoutDashboard,
  Users,
  UserCircle,
  CreditCard,
  Wallet,
  Receipt,
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
import { useSettings } from "@/hooks/useApi";
import { formatDate } from "@/lib/format";
import {
  formatServerPaymentReminder,
  getServerPaymentStatus,
  serverPaymentStyles,
} from "@/lib/serverPaymentReminder";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { GlobalSearch } from "@/components/shared/GlobalSearch";
import { NotificationBell } from "@/components/shared/NotificationBell";
import { LangSwitcher } from "@/components/shared/LangSwitcher";
import { isSnoozed } from "@/store/notifPrefs";
import { useT } from "@/lib/i18n";

const navItems = [
  { to: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { to: "/clients", labelKey: "nav.clients", icon: Users },
  { to: "/debts", labelKey: "nav.debts", icon: CreditCard },
  { to: "/payments", labelKey: "nav.payments", icon: Wallet },
  { to: "/reports", labelKey: "nav.reports", icon: FileText, ownerOnly: true },
  { to: "/transactions", labelKey: "nav.transactions", icon: Receipt, ownerOnly: true },
  { to: "/users", labelKey: "nav.users", icon: UserCircle, ownerOnly: true },
  { to: "/audit", labelKey: "nav.audit", icon: History, ownerOnly: true },
  { to: "/branches", labelKey: "nav.branches", icon: Building2, ownerOnly: true },
  { to: "/admins", labelKey: "nav.admins", icon: ShieldCheck, ownerOnly: true },
  { to: "/settings", labelKey: "nav.settings", icon: Settings, ownerOnly: true },
];

export function AppLayout() {
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const branding = useAppSettings();
  const { data: settings } = useSettings();
  const { t } = useT();
  const navigate = useNavigate();
  const isOwner = user?.role === "owner";
  const [mobileOpen, setMobileOpen] = useState(false);
  const serverPaymentDate = settings?.serverPaymentDate?.value?.trim() || "";
  const serverPaymentStatus = getServerPaymentStatus(serverPaymentDate);
  const serverPaymentStyle = serverPaymentStatus
    ? serverPaymentStyles(serverPaymentStatus.urgency)
    : null;

  const showServerPaymentToast = () => {
    if (!serverPaymentStatus || isSnoozed("serverPayment:global")) return;
    const formatted = formatDate(`${serverPaymentStatus.paymentDate}T00:00:00`);
    const msg = formatServerPaymentReminder(t, serverPaymentStatus, formatted);
    if (serverPaymentStatus.urgency === "overdue" || serverPaymentStatus.urgency === "today") {
      toast.warning(msg, { id: "server-payment-reminder", duration: 8000 });
    } else {
      toast.info(msg, { id: "server-payment-reminder", duration: 6000 });
    }
  };

  // Server to'lovi eslatmasi — kirganda va har 6 soatda
  useEffect(() => {
    if (!user || !serverPaymentStatus) return;
    showServerPaymentToast();
    const id = setInterval(showServerPaymentToast, 6 * 60 * 60 * 1000);
    return () => clearInterval(id);
  }, [user?.id, serverPaymentStatus?.paymentDate, serverPaymentStatus?.daysUntil]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogout = async () => {
    try {
      await api.post("/logout").catch(() => {});
    } finally {
      logout();
      navigate("/login", { replace: true });
      toast.success(t("header.logout"));
    }
  };

  // Login bo'lgach, qarzdorlar keshini fonda yangilab qo'yamiz
  // (server o'chsa ham — keshdan ko'rsatish uchun)
  useEffect(() => {
    if (!user) return;
    refreshDebtorsCache().catch(() => {});
    const id = setInterval(() => {
      refreshDebtorsCache().catch(() => {});
    }, 5 * 60 * 1000); // har 5 daqiqada
    return () => clearInterval(id);
  }, [user?.id]);

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
              {t(it.labelKey)}
            </NavLink>
          );
        })}
      </nav>
      <div className="p-4 border-t space-y-2">
        <div className="text-xs">
          <div className="font-medium">{user?.fullName}</div>
          <div className="text-muted-foreground">
            {isOwner
              ? t("header.role.owner")
              : `${t("header.role.admin")} · ${user?.branchName ?? "—"}`}
          </div>
        </div>
        <LangSwitcher />
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={cycleTheme} className="flex-1" title={t("header.theme")}>
            <ThemeIcon className="size-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleLogout} className="flex-1">
            <LogOut className="size-4" />
            <span className="hidden sm:inline">{t("header.logout")}</span>
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
          {serverPaymentStatus && serverPaymentStyle && (
            <div
              className={cn(
                "hidden md:flex items-center gap-2 shrink-0 rounded-md border px-3 py-1.5 text-xs",
                serverPaymentStyle.border,
                serverPaymentStyle.bg,
                serverPaymentStyle.pulse && "animate-pulse",
              )}
              title={formatServerPaymentReminder(
                t,
                serverPaymentStatus,
                formatDate(`${serverPaymentStatus.paymentDate}T00:00:00`),
              )}
            >
              <CalendarClock className={cn("size-3.5 shrink-0", serverPaymentStyle.icon)} />
              <span className="text-muted-foreground whitespace-nowrap hidden lg:inline">
                {t("header.serverPaymentDate")}:
              </span>
              <span className={cn("font-semibold whitespace-nowrap", serverPaymentStyle.text)}>
                {formatDate(`${serverPaymentStatus.paymentDate}T00:00:00`)}
              </span>
            </div>
          )}
          <NotificationBell />
          <div className="hidden sm:block">
            <LangSwitcher compact />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={cycleTheme}
            className="hidden md:inline-flex"
            title={t("header.theme")}
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
