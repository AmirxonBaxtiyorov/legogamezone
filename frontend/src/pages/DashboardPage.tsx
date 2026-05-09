import { useNavigate } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CreditCard,
  Users,
  Wallet,
  AlertTriangle,
  Calendar,
  TrendingUp,
} from "lucide-react";

import { useStats } from "@/hooks/useApi";
import { useBranchFilterStore } from "@/store/branchFilter";
import { useAuthStore } from "@/store/auth";
import { formatMoney, formatNumber, formatDate } from "@/lib/format";

import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { DebtStatus } from "@/types/api";

const STATUS_COLORS: Record<string, string> = {
  active: "#3b82f6",
  partial: "#f59e0b",
  paid: "#10b981",
  overdue: "#ef4444",
  cancelled: "#6b7280",
};

const METHOD_COLORS: Record<string, string> = {
  cash: "#10b981",
  card: "#3b82f6",
  transfer: "#8b5cf6",
};

export function DashboardPage() {
  const branchId = useBranchFilterStore((s) => s.branchId);
  const role = useAuthStore((s) => s.user?.role);
  const navigate = useNavigate();
  const { data, isLoading, error } = useStats(branchId);

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Boshqaruv paneli" />
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="text-center text-destructive py-12">
        Statistikani olishda xatolik
      </div>
    );
  }

  const cards = [
    {
      title: "Qoldiq qarz",
      value: formatMoney(data.money.totalRemaining),
      icon: CreditCard,
      color: "text-orange-500",
      onClick: () => navigate("/debts"),
    },
    {
      title: "Bu oy to'langan",
      value: formatMoney(data.money.thisMonthTotal),
      icon: Wallet,
      color: "text-emerald-500",
      onClick: () => navigate("/payments"),
    },
    {
      title: "Mijozlar",
      value: formatNumber(data.summary.clientsCount),
      icon: Users,
      color: "text-blue-500",
      onClick: () => navigate("/clients"),
    },
    {
      title: "Kechikkan",
      value: formatNumber(data.statusCounts.overdue),
      icon: AlertTriangle,
      color: "text-red-500",
      onClick: () => navigate("/debts"),
    },
  ];

  const timelineData = data.timeseries.map((t) => ({
    date: formatDate(t.date, "dd.MM"),
    "Qarz": t.debtAdded,
    "To'lov": t.paid,
  }));

  const statusData = Object.entries(data.statusCounts)
    .filter(([k]) => k !== "dueToday")
    .map(([k, v]) => ({ name: statusLabel(k), key: k, value: v }))
    .filter((d) => d.value > 0);

  const methodData = [
    { name: "Naqd", key: "cash", value: data.money.cashThisMonth },
    { name: "Karta", key: "card", value: data.money.cardThisMonth },
    { name: "O'tkazma", key: "transfer", value: data.money.transferThisMonth },
  ].filter((m) => m.value > 0);

  return (
    <div>
      <PageHeader
        title="Boshqaruv paneli"
        description={`Salom, ${data.viewer.fullName}!${
          data.viewer.role === "admin" && data.viewer.branchName
            ? ` (${data.viewer.branchName})`
            : ""
        }`}
      />

      {/* Stats cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-6">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Card
              key={c.title}
              role="button"
              onClick={c.onClick}
              className="cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {c.title}
                </CardTitle>
                <Icon className={`size-4 ${c.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold truncate">{c.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2 mb-6">
        {/* Timeline area chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-4 text-primary" />
              Oxirgi 30 kun
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="gQarz" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gPaid" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(v: number) => formatMoney(v)}
                  contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))" }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="Qarz" stroke="#f97316" fill="url(#gQarz)" strokeWidth={2} />
                <Area type="monotone" dataKey="To'lov" stroke="#10b981" fill="url(#gPaid)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status pie */}
        <Card>
          <CardHeader>
            <CardTitle>Status taqsimoti</CardTitle>
          </CardHeader>
          <CardContent>
            {statusData.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                Ma'lumot yo'q
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {statusData.map((d) => (
                      <Cell key={d.key} fill={STATUS_COLORS[d.key] ?? "#9ca3af"} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))" }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Methods bar */}
        <Card>
          <CardHeader>
            <CardTitle>Bu oy to'lov usullari</CardTitle>
          </CardHeader>
          <CardContent>
            {methodData.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">Bu oy to'lov yo'q</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={methodData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(v: number) => formatMoney(v)}
                    contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))" }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {methodData.map((d) => (
                      <Cell key={d.key} fill={METHOD_COLORS[d.key] ?? "#9ca3af"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Branch comparison (faqat owner) */}
      {role === "owner" && data.branches.length > 1 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filiallar taqqoslash</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.branches}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(v: number) => formatMoney(v)}
                  contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))" }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="totalAmount" name="Jami qarz" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="totalRemaining" name="Qoldiq" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Top debtors */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Eng katta qarzdorlar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {data.topClients.length === 0 ? (
            <p className="text-muted-foreground">Qarzdorlar yo'q</p>
          ) : (
            data.topClients.map((tc, i) => (
              <div
                key={tc.clientId}
                className="flex justify-between items-center py-2 border-b last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span className="size-7 rounded-full bg-primary/10 text-primary grid place-items-center text-xs font-bold">
                    {i + 1}
                  </span>
                  <div>
                    <div className="font-medium">{tc.name}</div>
                    <div className="text-xs text-muted-foreground">{tc.phone} · {tc.branch}</div>
                  </div>
                </div>
                <span className="font-semibold text-orange-500">{formatMoney(tc.totalRemaining)}</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Recent debts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="size-4" />
              Oxirgi qarzlar
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentDebts.length === 0 ? (
              <p className="text-muted-foreground text-sm">Yo'q</p>
            ) : (
              <div className="space-y-2 text-sm">
                {data.recentDebts.slice(0, 6).map((d) => (
                  <div key={d.id} className="flex justify-between items-center py-1 border-b last:border-0">
                    <div>
                      <div className="font-medium">{d.client}</div>
                      <div className="text-xs text-muted-foreground">{d.itemDetails || d.itemType}</div>
                    </div>
                    <div className="text-right">
                      <div>{formatMoney(d.remainingAmount)}</div>
                      <StatusBadge status={d.status as DebtStatus} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="size-4" />
              Oxirgi to'lovlar
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentPayments.length === 0 ? (
              <p className="text-muted-foreground text-sm">Yo'q</p>
            ) : (
              <div className="space-y-2 text-sm">
                {data.recentPayments.slice(0, 6).map((p) => (
                  <div key={p.id} className="flex justify-between items-center py-1 border-b last:border-0">
                    <div>
                      <div className="font-medium">{p.client}</div>
                      <div className="text-xs text-muted-foreground">{formatDate(p.paidDate)} · {p.method}</div>
                    </div>
                    <div className="font-semibold text-emerald-600">{formatMoney(p.amount)}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function statusLabel(k: string): string {
  return (
    {
      active: "Faol",
      partial: "Qisman",
      paid: "To'liq to'langan",
      overdue: "Kechikkan",
      cancelled: "Bekor qilingan",
    } as Record<string, string>
  )[k] ?? k;
}
