// Aqlli bildirishnomalar qo'ng'irog'i.
// 4 ta kategoriya: muddat (urgent), faollik (activity), eski qarzlar (stale),
// katta qoldiq (large). Tab orqali almashish, relative time, detail modal,
// mark-as-read, snooze, ovoz va brauzer native notification opt-in.

import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Bell,
  Clock,
  AlertTriangle,
  CalendarClock,
  X,
  Wallet,
  UserPlus,
  TrendingUp,
  Settings as SettingsIcon,
  Check,
  Phone,
  Copy,
  EyeOff,
  ChevronRight,
  Volume2,
  VolumeX,
  Globe,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { formatMoney, formatDate, formatDateTime, formatRelativeI18n } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";
import { useT } from "@/lib/i18n";
import {
  useNotifPrefs,
  isSnoozed,
  maybeShowBrowserNotification,
  playChime,
} from "@/store/notifPrefs";

// ==== Types ====
interface UrgentItem {
  id: number;
  clientId: number;
  client: string;
  clientPhone: string;
  branch: string;
  itemType: string;
  itemDetails: string | null;
  remaining: number;
  amount: number;
  dueDate: string;
  createdAt: string;
  createdBy: string;
  urgency: "overdue" | "today" | "soon";
  hoursUntil: number;
  notes?: string | null;
}
interface ActivityItemDebt {
  kind: "debt_created";
  id: number;
  clientId: number;
  client: string;
  clientPhone: string;
  branch: string;
  amount: number;
  itemType: string;
  itemDetails: string | null;
  by: string;
  byId: number;
  createdAt: string;
}
interface ActivityItemPayment {
  kind: "payment_received";
  id: number;
  clientId: number;
  client: string;
  clientPhone: string;
  branch: string;
  amount: number;
  method: "cash" | "card" | "transfer";
  debtId: number;
  by: string;
  byId: number;
  createdAt: string;
  paidDate: string;
}
interface ActivityItemClient {
  kind: "client_added";
  id: number;
  clientId: number;
  client: string;
  clientPhone: string;
  branch: string;
  by: null;
  byId: null;
  createdAt: string;
}
type ActivityItem = ActivityItemDebt | ActivityItemPayment | ActivityItemClient;

interface StaleItem {
  id: number;
  clientId: number;
  client: string;
  clientPhone: string;
  branch: string;
  remaining: number;
  amount: number;
  itemType: string;
  itemDetails: string | null;
  lastActivityAt: string;
  daysSince: number;
  createdAt: string;
  createdBy: string;
}
interface LargeItem {
  id: number;
  clientId: number;
  client: string;
  clientPhone: string;
  branch: string;
  remaining: number;
  amount: number;
  itemType: string;
  itemDetails: string | null;
  dueDate: string;
  createdAt: string;
  createdBy: string;
}

interface NotifResponse {
  generatedAt: string;
  items: UrgentItem[];
  counts: { total: number; overdue: number; today: number; soon: number };
  activity: ActivityItem[];
  activityCounts: {
    total: number;
    debts: number;
    payments: number;
    clients: number;
    paymentsAmount: number;
    debtsAmount: number;
  };
  stale: StaleItem[];
  staleCount: number;
  large: LargeItem[];
  largeCount: number;
  thresholds: { staleDays: number; large: number };
}

type Tab = "urgent" | "activity" | "stale" | "large";

// ==== Component ====
export function NotificationBell() {
  const token = useAuthStore((s) => s.token);
  const { t } = useT();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("urgent");
  const [detail, setDetail] = useState<
    | { kind: "urgent"; item: UrgentItem }
    | { kind: "activity"; item: ActivityItem }
    | { kind: "stale"; item: StaleItem }
    | { kind: "large"; item: LargeItem }
    | null
  >(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  // Preferences
  const prefs = useNotifPrefs();

  // Live tick — relative time o'zgarishi va snooze tugashi uchun
  const [, force] = useState(0);
  useEffect(() => {
    const id = setInterval(() => force((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  // ----- Data -----
  const { data, isLoading } = useQuery<NotifResponse>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const r = await api.get<NotifResponse>("/notifications");
      return r.data;
    },
    enabled: !!token,
    refetchInterval: prefs.refreshSeconds * 1000,
    staleTime: 15_000,
  });

  // ----- Snoozed ID'larni filterlash -----
  const visibleUrgent = useMemo(
    () => (data?.items ?? []).filter((it) => !isSnoozed(`urgent:${it.id}`)),
    [data, prefs.snoozedUntil], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const visibleStale = useMemo(
    () => (data?.stale ?? []).filter((it) => !isSnoozed(`stale:${it.id}`)),
    [data, prefs.snoozedUntil], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const urgentTotal = visibleUrgent.length;
  const overdue = visibleUrgent.filter((i) => i.urgency === "overdue").length;
  const totalBadge = urgentTotal + visibleStale.length;

  // ----- Yangi urgent kelganda ovoz + brauzer notify -----
  useEffect(() => {
    if (!data || !data.counts) return;
    const cur = (data.counts.overdue ?? 0) + (data.counts.today ?? 0);
    if (cur > prefs.lastSeenUrgentCount && prefs.lastSeenUrgentCount !== 0) {
      // Yangi urgent paydo bo'ldi
      playChime();
      const newest = data.items?.[0];
      if (newest) {
        maybeShowBrowserNotification(
          t("notif.urgency.overdue"),
          `${newest.client} — ${formatMoney(newest.remaining)}`,
          `urgent-${newest.id}`,
        );
      }
    }
    prefs.setLastSeenUrgent(cur);
  }, [data?.counts?.overdue, data?.counts?.today]); // eslint-disable-line react-hooks/exhaustive-deps

  // Tashqarisiga bosilganda yopish
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        // Settings yoki detail modal ochilgan bo'lsa, yopmaslik
        if ((e.target as HTMLElement)?.closest("[role=dialog]")) return;
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const goToClient = (clientId: number) => {
    setOpen(false);
    setDetail(null);
    navigate(`/clients?focus=${clientId}`);
  };

  const copyPhone = async (phone: string) => {
    try {
      await navigator.clipboard.writeText(phone);
      toast.success(t("notif.copyPhone") + " ✓");
    } catch {
      toast.error(t("common.error"));
    }
  };

  const markAllRead = () => {
    const keys: string[] = [];
    for (const it of visibleUrgent) keys.push(`urgent:${it.id}`);
    for (const it of (data?.activity ?? [])) keys.push(`activity:${it.kind}:${it.id}`);
    for (const it of visibleStale) keys.push(`stale:${it.id}`);
    for (const it of (data?.large ?? [])) keys.push(`large:${it.id}`);
    prefs.markAllRead(keys);
    toast.success(t("notif.markAllRead") + " ✓");
  };

  return (
    <div ref={wrapRef} className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setOpen((v) => !v)}
        title={t("notif.title")}
      >
        <Bell className="size-5" />
        {totalBadge > 0 && (
          <span
            className={cn(
              "absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full text-[10px] font-bold",
              "flex items-center justify-center px-1 text-white shadow",
              overdue > 0 ? "bg-red-600 animate-pulse" : "bg-amber-500",
            )}
          >
            {totalBadge > 99 ? "99+" : totalBadge}
          </span>
        )}
      </Button>

      {open && (
        <div
          className={cn(
            "absolute right-0 mt-2 w-[400px] max-w-[95vw] z-50 rounded-lg",
            "bg-popover text-popover-foreground border shadow-xl overflow-hidden",
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/40">
            <div className="flex items-center gap-2">
              <Bell className="size-4" />
              <span className="font-semibold text-sm">{t("notif.title")}</span>
              {totalBadge > 0 && (
                <span className="text-xs text-muted-foreground">({totalBadge})</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={markAllRead}
                title={t("notif.markAllRead")}
              >
                <Check className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setSettingsOpen(true)}
                title={t("notif.settings")}
              >
                <SettingsIcon className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setOpen(false)}
              >
                <X className="size-3.5" />
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="grid grid-cols-4 border-b text-xs">
            <TabBtn
              active={tab === "urgent"}
              onClick={() => setTab("urgent")}
              icon={<AlertTriangle className="size-3.5" />}
              label={t("notif.tab.urgent")}
              count={urgentTotal}
              accent={overdue > 0 ? "red" : "amber"}
            />
            <TabBtn
              active={tab === "activity"}
              onClick={() => setTab("activity")}
              icon={<TrendingUp className="size-3.5" />}
              label={t("notif.tab.activity")}
              count={data?.activityCounts?.total ?? 0}
              accent="blue"
            />
            <TabBtn
              active={tab === "stale"}
              onClick={() => setTab("stale")}
              icon={<Clock className="size-3.5" />}
              label={t("notif.tab.stale")}
              count={visibleStale.length}
              accent="slate"
            />
            <TabBtn
              active={tab === "large"}
              onClick={() => setTab("large")}
              icon={<Wallet className="size-3.5" />}
              label={t("notif.tab.large")}
              count={data?.largeCount ?? 0}
              accent="violet"
            />
          </div>

          {/* Body */}
          <div className="max-h-[440px] overflow-y-auto">
            {isLoading && (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                {t("common.loading")}
              </div>
            )}

            {!isLoading && tab === "urgent" && (
              <UrgentList
                items={visibleUrgent}
                t={t}
                onSelect={(it) => setDetail({ kind: "urgent", item: it })}
                onSnooze={(it, h) => {
                  prefs.snooze(`urgent:${it.id}`, h);
                  toast.success(t("notif.snooze") + " ✓");
                }}
              />
            )}

            {!isLoading && tab === "activity" && (
              <ActivityList
                items={data?.activity ?? []}
                t={t}
                onSelect={(it) => setDetail({ kind: "activity", item: it })}
              />
            )}

            {!isLoading && tab === "stale" && (
              <StaleList
                items={visibleStale}
                t={t}
                onSelect={(it) => setDetail({ kind: "stale", item: it })}
                onSnooze={(it, h) => {
                  prefs.snooze(`stale:${it.id}`, h);
                  toast.success(t("notif.snooze") + " ✓");
                }}
              />
            )}

            {!isLoading && tab === "large" && (
              <LargeList
                items={data?.large ?? []}
                t={t}
                onSelect={(it) => setDetail({ kind: "large", item: it })}
              />
            )}
          </div>

          <div className="px-4 py-2 border-t bg-muted/30 flex items-center justify-between">
            <div className="text-[10px] text-muted-foreground">
              {data ? formatRelativeI18n(data.generatedAt, t) : ""}
            </div>
            <button
              onClick={() => {
                setOpen(false);
                navigate("/debts?filter=overdue");
              }}
              className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
            >
              {t("nav.debts")}
              <ChevronRight className="size-3" />
            </button>
          </div>
        </div>
      )}

      {/* Detail modal */}
      <DetailModal
        open={!!detail}
        onClose={() => setDetail(null)}
        detail={detail}
        t={t}
        onGoToClient={goToClient}
        onCopyPhone={copyPhone}
      />

      {/* Settings modal */}
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        t={t}
      />
    </div>
  );
}

// ==== Sub-components ====

function TabBtn({
  active,
  onClick,
  icon,
  label,
  count,
  accent,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count: number;
  accent: "red" | "amber" | "blue" | "slate" | "violet";
}) {
  const accentMap: Record<string, string> = {
    red: "text-red-600 dark:text-red-400",
    amber: "text-amber-600 dark:text-amber-400",
    blue: "text-blue-600 dark:text-blue-400",
    slate: "text-slate-600 dark:text-slate-400",
    violet: "text-violet-600 dark:text-violet-400",
  };
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-2 py-2 text-center transition-colors flex flex-col items-center gap-0.5 border-r last:border-r-0",
        active ? "bg-accent" : "hover:bg-accent/50",
      )}
    >
      <div className={cn("flex items-center gap-1", accentMap[accent])}>
        {icon}
        <span className="font-semibold">{count}</span>
      </div>
      <div className="text-muted-foreground text-[10px]">{label}</div>
    </button>
  );
}

function UrgentList({
  items,
  t,
  onSelect,
  onSnooze,
}: {
  items: UrgentItem[];
  t: (k: string, fb?: string) => string;
  onSelect: (it: UrgentItem) => void;
  onSnooze: (it: UrgentItem, hours: number) => void;
}) {
  if (items.length === 0)
    return (
      <EmptyHint
        icon={<Bell className="size-8 mx-auto opacity-30 mb-2" />}
        title={t("notif.empty")}
        hint={t("notif.empty.hint")}
      />
    );
  return (
    <div>
      {items.map((it) => {
        const colorClass =
          it.urgency === "overdue"
            ? "border-l-red-500"
            : it.urgency === "today"
            ? "border-l-amber-500"
            : "border-l-blue-500";
        const Icon =
          it.urgency === "overdue"
            ? AlertTriangle
            : it.urgency === "today"
            ? Clock
            : CalendarClock;
        const iconColor =
          it.urgency === "overdue"
            ? "text-red-500"
            : it.urgency === "today"
            ? "text-amber-500"
            : "text-blue-500";
        const urgencyLabel =
          it.urgency === "overdue"
            ? `${t("notif.urgency.overdue")} (${Math.abs(it.hoursUntil)}h)`
            : it.urgency === "today"
            ? t("notif.urgency.today")
            : `${t("notif.urgency.soon")} (${it.hoursUntil}h)`;
        return (
          <div
            key={it.id}
            className={cn(
              "px-4 py-3 border-b last:border-b-0 border-l-4 hover:bg-accent transition-colors",
              colorClass,
            )}
          >
            <button onClick={() => onSelect(it)} className="w-full text-left">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="font-medium text-sm truncate flex-1">{it.client}</div>
                <div className={cn("flex items-center gap-1 text-xs whitespace-nowrap", iconColor)}>
                  <Icon className="size-3" />
                  <span className="font-medium">{urgencyLabel}</span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground mb-1 truncate">
                📞 {it.clientPhone} · 🏢 {it.branch}
              </div>
              <div className="text-xs text-muted-foreground mb-1 truncate">
                🎮 {it.itemDetails || it.itemType} · ✍️ {it.createdBy}
              </div>
              <div className="flex items-center justify-between gap-2 mt-1.5">
                <div className="text-[11px] text-muted-foreground">
                  {t("notif.detail.dueDate")}: {formatDate(it.dueDate)}
                </div>
                <div className="text-sm font-semibold">{formatMoney(it.remaining)}</div>
              </div>
            </button>
            <div className="flex items-center justify-end gap-1 mt-2">
              <SnoozeMenu onSnooze={(h) => onSnooze(it, h)} t={t} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ActivityList({
  items,
  t,
  onSelect,
}: {
  items: ActivityItem[];
  t: (k: string, fb?: string) => string;
  onSelect: (it: ActivityItem) => void;
}) {
  if (items.length === 0)
    return (
      <EmptyHint
        icon={<TrendingUp className="size-8 mx-auto opacity-30 mb-2" />}
        title={t("notif.empty")}
      />
    );
  return (
    <div>
      {items.map((it) => {
        const config =
          it.kind === "debt_created"
            ? { Icon: CalendarClock, color: "text-orange-500", border: "border-l-orange-500", label: t("notif.activity.debt") }
            : it.kind === "payment_received"
            ? { Icon: Wallet, color: "text-emerald-500", border: "border-l-emerald-500", label: t("notif.activity.payment") }
            : { Icon: UserPlus, color: "text-blue-500", border: "border-l-blue-500", label: t("notif.activity.client") };
        return (
          <button
            key={`${it.kind}-${it.id}`}
            onClick={() => onSelect(it)}
            className={cn(
              "w-full text-left px-4 py-3 border-b last:border-b-0 border-l-4",
              "hover:bg-accent transition-colors",
              config.border,
            )}
          >
            <div className="flex items-start justify-between gap-2 mb-0.5">
              <div className={cn("flex items-center gap-1 text-xs font-medium", config.color)}>
                <config.Icon className="size-3.5" />
                {config.label}
              </div>
              <div className="text-[11px] text-muted-foreground whitespace-nowrap">
                {formatRelativeI18n(it.createdAt, t)}
              </div>
            </div>
            <div className="font-medium text-sm truncate">{it.client}</div>
            <div className="text-xs text-muted-foreground truncate">
              📞 {it.clientPhone} · 🏢 {it.branch}
            </div>
            {(it.kind === "debt_created" || it.kind === "payment_received") && (
              <div className="flex items-center justify-between gap-2 mt-1">
                <div className="text-[11px] text-muted-foreground">
                  ✍️ {it.by}{" "}
                  {it.kind === "payment_received" && <span className="ml-1">· {it.method}</span>}
                </div>
                <div className="text-sm font-semibold">{formatMoney(it.amount)}</div>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

function StaleList({
  items,
  t,
  onSelect,
  onSnooze,
}: {
  items: StaleItem[];
  t: (k: string, fb?: string) => string;
  onSelect: (it: StaleItem) => void;
  onSnooze: (it: StaleItem, hours: number) => void;
}) {
  if (items.length === 0)
    return (
      <EmptyHint
        icon={<Clock className="size-8 mx-auto opacity-30 mb-2" />}
        title={t("notif.empty")}
      />
    );
  return (
    <div>
      {items.map((it) => (
        <div
          key={it.id}
          className="px-4 py-3 border-b last:border-b-0 border-l-4 border-l-slate-500 hover:bg-accent transition-colors"
        >
          <button onClick={() => onSelect(it)} className="w-full text-left">
            <div className="flex items-start justify-between gap-2 mb-0.5">
              <div className="font-medium text-sm truncate flex-1">{it.client}</div>
              <div className="flex items-center gap-1 text-xs whitespace-nowrap text-slate-500">
                <Clock className="size-3" />
                <span className="font-medium">
                  {it.daysSince} {t("notif.stale.label")}
                </span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground mb-1 truncate">
              📞 {it.clientPhone} · 🏢 {it.branch}
            </div>
            <div className="flex items-center justify-between gap-2 mt-1">
              <div className="text-[11px] text-muted-foreground">
                {formatRelativeI18n(it.lastActivityAt, t)}
              </div>
              <div className="text-sm font-semibold">{formatMoney(it.remaining)}</div>
            </div>
          </button>
          <div className="flex items-center justify-end gap-1 mt-2">
            <SnoozeMenu onSnooze={(h) => onSnooze(it, h)} t={t} />
          </div>
        </div>
      ))}
    </div>
  );
}

function LargeList({
  items,
  t,
  onSelect,
}: {
  items: LargeItem[];
  t: (k: string, fb?: string) => string;
  onSelect: (it: LargeItem) => void;
}) {
  if (items.length === 0)
    return (
      <EmptyHint icon={<Wallet className="size-8 mx-auto opacity-30 mb-2" />} title={t("notif.empty")} />
    );
  return (
    <div>
      {items.map((it) => (
        <button
          key={it.id}
          onClick={() => onSelect(it)}
          className="w-full text-left px-4 py-3 border-b last:border-b-0 border-l-4 border-l-violet-500 hover:bg-accent transition-colors"
        >
          <div className="flex items-start justify-between gap-2 mb-0.5">
            <div className="font-medium text-sm truncate flex-1">{it.client}</div>
            <div className="flex items-center gap-1 text-xs whitespace-nowrap text-violet-500">
              <Wallet className="size-3" />
              <span className="font-medium">{t("notif.large.label")}</span>
            </div>
          </div>
          <div className="text-xs text-muted-foreground mb-1 truncate">
            📞 {it.clientPhone} · 🏢 {it.branch}
          </div>
          <div className="flex items-center justify-between gap-2 mt-1">
            <div className="text-[11px] text-muted-foreground truncate">
              ✍️ {it.createdBy} · {formatRelativeI18n(it.createdAt, t)}
            </div>
            <div className="text-sm font-bold text-violet-600 dark:text-violet-400">
              {formatMoney(it.remaining)}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

function EmptyHint({
  icon,
  title,
  hint,
}: {
  icon: React.ReactNode;
  title: string;
  hint?: string;
}) {
  return (
    <div className="px-4 py-10 text-center text-sm text-muted-foreground">
      {icon}
      <div>{title}</div>
      {hint && <div className="text-xs mt-1 opacity-70">{hint}</div>}
    </div>
  );
}

function SnoozeMenu({
  onSnooze,
  t,
}: {
  onSnooze: (hours: number) => void;
  t: (k: string, fb?: string) => string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1 px-2 py-0.5 rounded hover:bg-accent"
      >
        <EyeOff className="size-3" />
        {t("notif.snooze")}
      </button>
      {open && (
        <div className="absolute right-0 mt-1 z-10 bg-popover border rounded-md shadow-lg overflow-hidden text-xs">
          {[
            { h: 1, label: t("notif.snooze.1h") },
            { h: 4, label: t("notif.snooze.4h") },
            { h: 24, label: t("notif.snooze.24h") },
          ].map((opt) => (
            <button
              key={opt.h}
              onClick={() => {
                onSnooze(opt.h);
                setOpen(false);
              }}
              className="block w-full text-left px-3 py-1.5 hover:bg-accent whitespace-nowrap"
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ==== Detail modal ====
function DetailModal({
  open,
  onClose,
  detail,
  t,
  onGoToClient,
  onCopyPhone,
}: {
  open: boolean;
  onClose: () => void;
  detail:
    | { kind: "urgent"; item: UrgentItem }
    | { kind: "activity"; item: ActivityItem }
    | { kind: "stale"; item: StaleItem }
    | { kind: "large"; item: LargeItem }
    | null;
  t: (k: string, fb?: string) => string;
  onGoToClient: (id: number) => void;
  onCopyPhone: (phone: string) => void;
}) {
  if (!detail) return null;
  const it = detail.item;
  const phone = (it as { clientPhone?: string }).clientPhone ?? "";
  const clientId = (it as { clientId?: number }).clientId;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("notif.detail.title")}</DialogTitle>
          <DialogDescription>
            {(it as { client?: string }).client ?? ""}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          {detail.kind === "urgent" && <UrgentDetail it={detail.item} t={t} />}
          {detail.kind === "activity" && <ActivityDetail it={detail.item} t={t} />}
          {detail.kind === "stale" && <StaleDetail it={detail.item} t={t} />}
          {detail.kind === "large" && <LargeDetail it={detail.item} t={t} />}
        </div>

        <div className="flex flex-wrap gap-2 pt-3 border-t">
          {phone && (
            <>
              <Button asChild variant="outline" size="sm">
                <a href={`tel:${phone}`}>
                  <Phone className="size-4" />
                  {t("notif.callClient")}
                </a>
              </Button>
              <Button variant="outline" size="sm" onClick={() => onCopyPhone(phone)}>
                <Copy className="size-4" />
                {t("notif.copyPhone")}
              </Button>
            </>
          )}
          {clientId && (
            <Button
              variant="default"
              size="sm"
              className="ml-auto"
              onClick={() => onGoToClient(clientId)}
            >
              {t("notif.openClient")}
              <ChevronRight className="size-4" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, value }: { label: string; value: string | React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}

function UrgentDetail({ it, t }: { it: UrgentItem; t: (k: string, fb?: string) => string }) {
  return (
    <>
      <Field label={t("audit.col.branch")} value={it.branch} />
      <Field label={t("notif.detail.item")} value={it.itemDetails || it.itemType} />
      <Field label={t("notif.detail.amount")} value={formatMoney(it.amount)} />
      <Field
        label={t("notif.detail.remaining")}
        value={<span className="font-bold text-orange-500">{formatMoney(it.remaining)}</span>}
      />
      <Field label={t("notif.detail.dueDate")} value={formatDate(it.dueDate)} />
      <Field label={t("notif.detail.createdAt")} value={formatDateTime(it.createdAt)} />
      <Field label={t("notif.detail.recordedBy")} value={it.createdBy} />
      {it.notes && <Field label="📝" value={<span className="text-xs">{it.notes}</span>} />}
    </>
  );
}

function ActivityDetail({ it, t }: { it: ActivityItem; t: (k: string, fb?: string) => string }) {
  return (
    <>
      <Field label={t("audit.col.branch")} value={it.branch} />
      <Field
        label={t("audit.col.action")}
        value={
          it.kind === "debt_created"
            ? t("notif.activity.debt")
            : it.kind === "payment_received"
            ? t("notif.activity.payment")
            : t("notif.activity.client")
        }
      />
      <Field label={t("notif.detail.createdAt")} value={formatDateTime(it.createdAt)} />
      {it.kind !== "client_added" && it.by && (
        <Field label={t("notif.detail.recordedBy")} value={it.by} />
      )}
      {(it.kind === "debt_created" || it.kind === "payment_received") && (
        <Field label={t("notif.detail.amount")} value={formatMoney(it.amount)} />
      )}
      {it.kind === "payment_received" && (
        <Field label={t("notif.detail.method")} value={it.method} />
      )}
      {it.kind === "debt_created" && (
        <Field label={t("notif.detail.item")} value={it.itemDetails || it.itemType} />
      )}
    </>
  );
}

function StaleDetail({ it, t }: { it: StaleItem; t: (k: string, fb?: string) => string }) {
  return (
    <>
      <Field label={t("audit.col.branch")} value={it.branch} />
      <Field label={t("notif.detail.item")} value={it.itemDetails || it.itemType} />
      <Field label={t("notif.detail.amount")} value={formatMoney(it.amount)} />
      <Field
        label={t("notif.detail.remaining")}
        value={<span className="font-bold text-orange-500">{formatMoney(it.remaining)}</span>}
      />
      <Field
        label={t("notif.tab.stale")}
        value={`${it.daysSince} ${t("notif.stale.label")}`}
      />
      <Field label={t("notif.detail.createdAt")} value={formatDateTime(it.createdAt)} />
      <Field label={t("notif.detail.recordedBy")} value={it.createdBy} />
    </>
  );
}

function LargeDetail({ it, t }: { it: LargeItem; t: (k: string, fb?: string) => string }) {
  return (
    <>
      <Field label={t("audit.col.branch")} value={it.branch} />
      <Field label={t("notif.detail.item")} value={it.itemDetails || it.itemType} />
      <Field label={t("notif.detail.amount")} value={formatMoney(it.amount)} />
      <Field
        label={t("notif.detail.remaining")}
        value={<span className="font-bold text-violet-500">{formatMoney(it.remaining)}</span>}
      />
      <Field label={t("notif.detail.dueDate")} value={formatDate(it.dueDate)} />
      <Field label={t("notif.detail.createdAt")} value={formatDateTime(it.createdAt)} />
      <Field label={t("notif.detail.recordedBy")} value={it.createdBy} />
    </>
  );
}

// ==== Settings modal ====
function SettingsModal({
  open,
  onClose,
  t,
}: {
  open: boolean;
  onClose: () => void;
  t: (k: string, fb?: string) => string;
}) {
  const prefs = useNotifPrefs();

  const requestBrowser = async (enable: boolean) => {
    if (!enable) {
      prefs.setBrowser(false);
      return;
    }
    if (!("Notification" in window)) {
      toast.error(t("common.error"));
      return;
    }
    if (Notification.permission === "denied") {
      toast.error(t("notif.settings.browser") + " — denied");
      return;
    }
    try {
      const r = await Notification.requestPermission();
      if (r === "granted") {
        prefs.setBrowser(true);
        toast.success(t("common.save") + " ✓");
      } else {
        prefs.setBrowser(false);
      }
    } catch {
      prefs.setBrowser(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("notif.settings")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <ToggleRow
            icon={prefs.soundEnabled ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
            label={t("notif.settings.sound")}
            checked={prefs.soundEnabled}
            onChange={(v) => {
              prefs.setSound(v);
              if (v) playChime();
            }}
          />
          <ToggleRow
            icon={<Globe className="size-4" />}
            label={t("notif.settings.browser")}
            hint={t("notif.settings.browser.hint")}
            checked={prefs.browserEnabled}
            onChange={requestBrowser}
          />
          <div className="space-y-1.5">
            <Label className="text-xs">{t("notif.settings.refresh")}</Label>
            <Select
              value={String(prefs.refreshSeconds)}
              onValueChange={(v) =>
                prefs.setRefresh(Number(v) as 30 | 60 | 120 | 300)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 s</SelectItem>
                <SelectItem value="60">1 min</SelectItem>
                <SelectItem value="120">2 min</SelectItem>
                <SelectItem value="300">5 min</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ToggleRow({
  icon,
  label,
  hint,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start justify-between gap-3 cursor-pointer">
      <div className="flex items-start gap-2">
        <div className="mt-0.5">{icon}</div>
        <div>
          <div className="text-sm font-medium">{label}</div>
          {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
        </div>
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 size-4 cursor-pointer"
      />
    </label>
  );
}
