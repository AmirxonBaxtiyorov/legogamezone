import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FileSpreadsheet, FileText, Calendar } from "lucide-react";
import { toast } from "sonner";

import { useRangeReport } from "@/hooks/useApi";
import { useBranchFilterStore } from "@/store/branchFilter";
import { api, getErrorMessage } from "@/lib/api";
import { formatMoney, formatDate } from "@/lib/format";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// datetime-local format: "YYYY-MM-DDTHH:mm"
function isoForInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const presets = [
  { label: "Bugun", get: () => ({ from: startOfDay(new Date()), to: new Date() }) },
  { label: "Kecha", get: () => {
    const y = new Date(); y.setDate(y.getDate() - 1);
    return { from: startOfDay(y), to: endOfDay(y) };
  }},
  { label: "So'nggi 7 kun", get: () => {
    const f = new Date(); f.setDate(f.getDate() - 7);
    return { from: startOfDay(f), to: new Date() };
  }},
  { label: "Bu oy", get: () => {
    const f = new Date(); f.setDate(1); f.setHours(0, 0, 0, 0);
    return { from: f, to: new Date() };
  }},
  { label: "O'tgan oy", get: () => {
    const now = new Date();
    const f = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const t = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    return { from: f, to: t };
  }},
  { label: "Bu yil", get: () => {
    const now = new Date();
    return { from: new Date(now.getFullYear(), 0, 1), to: now };
  }},
];

function startOfDay(d: Date): Date {
  const x = new Date(d); x.setHours(0, 0, 0, 0); return x;
}
function endOfDay(d: Date): Date {
  const x = new Date(d); x.setHours(23, 59, 59, 999); return x;
}

export function ReportsPage() {
  const branchId = useBranchFilterStore((s) => s.branchId);

  // Default: bu oy
  const initialFrom = (() => {
    const d = new Date(); d.setDate(1); d.setHours(0, 0, 0, 0); return d;
  })();
  const initialTo = new Date();

  const [from, setFrom] = useState(isoForInput(initialFrom));
  const [to, setTo] = useState(isoForInput(initialTo));

  const fromIso = useMemo(() => from ? new Date(from).toISOString() : "", [from]);
  const toIso = useMemo(() => to ? new Date(to).toISOString() : "", [to]);

  const { data, isLoading, error } = useRangeReport(fromIso, toIso, branchId);

  const applyPreset = (p: (typeof presets)[number]) => {
    const r = p.get();
    setFrom(isoForInput(r.from));
    setTo(isoForInput(r.to));
  };

  const downloadFile = async (
    kind: "debtors" | "payments" | "all-debts",
    format: "excel" | "pdf",
  ) => {
    try {
      // axios `api` instance ishlatamiz: VITE_API_URL ga o'zi qo'yiladi
      // (legogamezone.uz emas, api.legogamezone.uz ga boradi) va JWT header
      // interceptor orqali avtomatik qo'shiladi.
      const r = await api.get(`/export/${format}`, {
        responseType: "blob",
        params: {
          kind,
          ...(branchId ? { branchId } : {}),
          ...(from ? { from: from.slice(0, 10) } : {}),
          ...(to ? { to: to.slice(0, 10) } : {}),
        },
      });
      const blob = r.data as Blob;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `gamezone-${kind}-${new Date().toISOString().slice(0, 10)}.${
        format === "excel" ? "xlsx" : "pdf"
      }`;
      a.click();
      URL.revokeObjectURL(a.href);
      toast.success("Yuklab olindi");
    } catch (err) {
      toast.error(`Eksport xatosi: ${getErrorMessage(err)}`);
    }
  };

  const dailyChart = useMemo(() => {
    if (!data?.daily) return [];
    return data.daily.map((d) => ({
      date: formatDate(d.date, "dd.MM"),
      "Qarz": d.debtsAmount,
      "To'lov": d.paymentsAmount,
    }));
  }, [data]);

  return (
    <div>
      <PageHeader title="Hisobotlar" description="Sana oraliq bo'yicha hisobot va eksport" />

      {/* Date range picker */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="size-4 text-primary" />
            Sana oraliq
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {presets.map((p) => (
              <Button key={p.label} size="sm" variant="outline" onClick={() => applyPreset(p)}>
                {p.label}
              </Button>
            ))}
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Boshidan (sana va vaqt)</Label>
              <Input
                type="datetime-local"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                step={60}
              />
            </div>
            <div className="space-y-2">
              <Label>Oxirigacha (sana va vaqt)</Label>
              <Input
                type="datetime-local"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                step={60}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export buttons */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Eksport</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <ExportRow
            title="Qarzdorlar"
            description="Faol/qisman/kechikkan qarzlar"
            onExcel={() => downloadFile("debtors", "excel")}
            onPdf={() => downloadFile("debtors", "pdf")}
          />
          <ExportRow
            title="To'lovlar (oraliq)"
            description="Tanlangan oraliq to'lovlari"
            onExcel={() => downloadFile("payments", "excel")}
            onPdf={() => downloadFile("payments", "pdf")}
          />
          <ExportRow
            title="Barcha qarzlar"
            description="Filtrsiz to'liq tarix"
            onExcel={() => downloadFile("all-debts", "excel")}
            onPdf={() => downloadFile("all-debts", "pdf")}
          />
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Davriy hisobot</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-destructive text-sm">
              {(error as Error).message ?? "Hisobot olishda xato"}
            </div>
          ) : isLoading || !data ? (
            <div className="text-muted-foreground text-sm">Yuklanmoqda...</div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                <Stat label="Yangi qarzlar (soni)" value={String(data.summary.debtsCount)} />
                <Stat label="Yangi qarz (summa)" value={formatMoney(data.summary.totalDebtAdded)} />
                <Stat label="To'lovlar (soni)" value={String(data.summary.paymentsCount)} />
                <Stat label="Tushum (jami)" value={formatMoney(data.summary.totalPaid)} accent="emerald" />
                <Stat label="Naqd" value={formatMoney(data.summary.cashTotal)} />
                <Stat label="Karta" value={formatMoney(data.summary.cardTotal)} />
                <Stat label="O'tkazma" value={formatMoney(data.summary.transferTotal)} />
              </div>

              {dailyChart.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium mb-3">Kunlik dinamika</h4>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={dailyChart}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                      <Tooltip
                        formatter={(v: number) => formatMoney(v)}
                        contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))" }}
                      />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="Qarz" fill="#f97316" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="To'lov" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {data.byBranch && data.byBranch.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium mb-3">Filiallar bo'yicha</h4>
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {data.byBranch.map((b) => (
                      <div key={b.id} className="rounded-lg border p-3">
                        <div className="font-medium">{b.name}</div>
                        <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                          <div>
                            <div className="text-muted-foreground">Yangi qarzlar</div>
                            <div className="font-semibold">{b.debtsCount}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Summa</div>
                            <div className="font-semibold">{formatMoney(b.debtsAmount)}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">To'lovlar</div>
                            <div className="font-semibold">{b.paymentsCount}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Tushum</div>
                            <div className="font-semibold text-emerald-600">{formatMoney(b.paymentsAmount)}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {data.byAdmin && data.byAdmin.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium mb-3">Adminlar samaradorligi</h4>
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {data.byAdmin.map((a) => (
                      <div key={a.id} className="rounded-lg border p-3">
                        <div className="font-medium">{a.name}</div>
                        <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                          <div>
                            <div className="text-muted-foreground">Qarzlar</div>
                            <div className="font-semibold">
                              {a.debtsCount} ({formatMoney(a.debtsAmount)})
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">To'lovlar</div>
                            <div className="font-semibold text-emerald-600">
                              {a.paymentsCount} ({formatMoney(a.paymentsAmount)})
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: "emerald" | "red" }) {
  const cls =
    accent === "emerald"
      ? "text-emerald-600"
      : accent === "red"
        ? "text-red-500"
        : "";
  return (
    <div className="rounded-lg border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`text-lg font-semibold mt-1 ${cls}`}>{value}</div>
    </div>
  );
}

function ExportRow({
  title,
  description,
  onExcel,
  onPdf,
}: {
  title: string;
  description: string;
  onExcel: () => void;
  onPdf: () => void;
}) {
  return (
    <div className="border rounded-lg p-3">
      <div className="font-medium">{title}</div>
      <div className="text-xs text-muted-foreground mb-3">{description}</div>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" className="flex-1" onClick={onExcel}>
          <FileSpreadsheet className="size-4" />
          Excel
        </Button>
        <Button size="sm" variant="outline" className="flex-1" onClick={onPdf}>
          <FileText className="size-4" />
          PDF
        </Button>
      </div>
    </div>
  );
}
