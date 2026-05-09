// Bildirishnomalar qo'ng'irog'i — header'da turadi.
// 48 soat ichida muddati tugaydigan / o'tgan qarzlarni ko'rsatadi.

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Bell, Clock, AlertTriangle, CalendarClock, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { formatMoney, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";

type NotificationItem = {
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
  urgency: "overdue" | "today" | "soon";
  hoursUntil: number;
};

type NotificationsResponse = {
  generatedAt: string;
  items: NotificationItem[];
  counts: {
    total: number;
    overdue: number;
    today: number;
    soon: number;
  };
};

export function NotificationBell() {
  const token = useAuthStore((s) => s.token);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  const { data, isLoading } = useQuery<NotificationsResponse>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const r = await api.get<NotificationsResponse>("/notifications");
      return r.data;
    },
    enabled: !!token,
    refetchInterval: 60_000, // har daqiqada yangilanadi
    staleTime: 30_000,
  });

  // Tashqarisiga bosilganda yopish
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const total = data?.counts.total ?? 0;
  const overdue = data?.counts.overdue ?? 0;

  const goToClient = (clientId: number) => {
    setOpen(false);
    navigate(`/clients?focus=${clientId}`);
  };

  return (
    <div ref={wrapRef} className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setOpen((v) => !v)}
        title="Bildirishnomalar"
      >
        <Bell className="size-5" />
        {total > 0 && (
          <span
            className={cn(
              "absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full text-[10px] font-bold",
              "flex items-center justify-center px-1 text-white shadow",
              overdue > 0 ? "bg-red-600 animate-pulse" : "bg-amber-500",
            )}
          >
            {total > 99 ? "99+" : total}
          </span>
        )}
      </Button>

      {open && (
        <div
          className={cn(
            "absolute right-0 mt-2 w-[360px] max-w-[90vw] z-50 rounded-lg",
            "bg-popover text-popover-foreground border shadow-xl overflow-hidden",
          )}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/40">
            <div className="flex items-center gap-2">
              <Bell className="size-4" />
              <span className="font-semibold text-sm">Bildirishnomalar</span>
              {total > 0 && (
                <span className="text-xs text-muted-foreground">
                  ({total})
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setOpen(false)}
            >
              <X className="size-3.5" />
            </Button>
          </div>

          {/* Counts summary */}
          {data && total > 0 && (
            <div className="grid grid-cols-3 text-center text-xs border-b">
              <div className="px-2 py-2 border-r">
                <div className="text-red-600 font-semibold flex items-center justify-center gap-1">
                  <AlertTriangle className="size-3" />
                  {data.counts.overdue}
                </div>
                <div className="text-muted-foreground mt-0.5">Kechikkan</div>
              </div>
              <div className="px-2 py-2 border-r">
                <div className="text-amber-600 font-semibold flex items-center justify-center gap-1">
                  <Clock className="size-3" />
                  {data.counts.today}
                </div>
                <div className="text-muted-foreground mt-0.5">Bugun</div>
              </div>
              <div className="px-2 py-2">
                <div className="text-blue-600 font-semibold flex items-center justify-center gap-1">
                  <CalendarClock className="size-3" />
                  {data.counts.soon}
                </div>
                <div className="text-muted-foreground mt-0.5">Yaqin 48s</div>
              </div>
            </div>
          )}

          <div className="max-h-[420px] overflow-y-auto">
            {isLoading && (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                Yuklanmoqda...
              </div>
            )}

            {!isLoading && total === 0 && (
              <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                <Bell className="size-8 mx-auto opacity-30 mb-2" />
                <div>Yangi bildirishnomalar yo'q</div>
                <div className="text-xs mt-1">
                  48 soat ichida muddati tugaydigan qarz topilmadi
                </div>
              </div>
            )}

            {!isLoading &&
              data?.items.map((it) => {
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
                const urgencyLabel =
                  it.urgency === "overdue"
                    ? `Kechikkan (${Math.abs(it.hoursUntil)}s avval)`
                    : it.urgency === "today"
                    ? "Bugun muddati"
                    : `${it.hoursUntil}s ichida`;
                const iconColor =
                  it.urgency === "overdue"
                    ? "text-red-500"
                    : it.urgency === "today"
                    ? "text-amber-500"
                    : "text-blue-500";
                return (
                  <button
                    key={it.id}
                    onClick={() => goToClient(it.clientId)}
                    className={cn(
                      "w-full text-left px-4 py-3 border-b last:border-b-0",
                      "border-l-4 hover:bg-accent transition-colors",
                      colorClass,
                    )}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="font-medium text-sm truncate flex-1">
                        {it.client}
                      </div>
                      <div className={cn("flex items-center gap-1 text-xs", iconColor)}>
                        <Icon className="size-3" />
                        <span className="font-medium">{urgencyLabel}</span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mb-1">
                      📞 {it.clientPhone} · 🏢 {it.branch}
                    </div>
                    <div className="text-xs text-muted-foreground mb-1">
                      🎮 {it.itemDetails || it.itemType}
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-1.5">
                      <div className="text-xs text-muted-foreground">
                        Muddat: {formatDate(it.dueDate)}
                      </div>
                      <div className="text-sm font-semibold text-foreground">
                        {formatMoney(it.remaining)}
                      </div>
                    </div>
                  </button>
                );
              })}
          </div>

          {data && total > 0 && (
            <div className="px-4 py-2 border-t bg-muted/30 text-center">
              <button
                onClick={() => {
                  setOpen(false);
                  navigate("/debts?filter=overdue");
                }}
                className="text-xs text-primary hover:underline font-medium"
              >
                Barcha qarzdorlik holatlarini ko'rish →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
