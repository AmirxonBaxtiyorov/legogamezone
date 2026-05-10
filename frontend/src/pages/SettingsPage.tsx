import { useEffect, useState } from "react";
import { Save, Upload, Download, Trash2, RefreshCw, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { useSettings, useUpdateSettings } from "@/hooks/useApi";
import { useT } from "@/lib/i18n";
import { LangSwitcher } from "@/components/shared/LangSwitcher";
import {
  refreshDebtorsCache,
  debtorsCachedAt,
  clearDebtorsCache,
  downloadFullSnapshot,
  readDebtorsCache,
} from "@/lib/offline-cache";

import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SettingsPage() {
  const { t } = useT();
  const { data: settings, isLoading } = useSettings();
  const update = useUpdateSettings();

  const [name, setName] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#4f46e5");
  const [logo, setLogo] = useState<string | null>(null);

  const [cacheAt, setCacheAt] = useState<string | null>(null);
  const [cacheCount, setCacheCount] = useState<number>(0);
  const [busy, setBusy] = useState<"refresh" | "snapshot" | null>(null);

  useEffect(() => {
    if (!settings) return;
    setName(settings.systemName?.value ?? "Game Zone Qarz");
    setSubtitle(settings.systemSubtitle?.value ?? "");
    setPrimaryColor(settings.primaryColor?.value ?? "#4f46e5");
    setLogo(settings.logo?.value ?? null);
  }, [settings]);

  // Boshlanishida keshdan o'qib olamiz
  useEffect(() => {
    setCacheAt(debtorsCachedAt());
    setCacheCount(readDebtorsCache()?.total ?? 0);
  }, []);

  const onUpload = (file: File) => {
    if (file.size > 2_000_000) {
      toast.error("Logo 2 MB dan kichik bo'lsin");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setLogo(reader.result as string);
    reader.readAsDataURL(file);
  };

  const save = async () => {
    await update.mutateAsync({
      systemName: name,
      systemSubtitle: subtitle,
      primaryColor,
      ...(logo ? { logo } : {}),
    });
  };

  const refreshCache = async () => {
    setBusy("refresh");
    try {
      const r = await refreshDebtorsCache();
      if (!r) {
        toast.error(t("common.error"));
        return;
      }
      setCacheAt(debtorsCachedAt());
      setCacheCount(r.total);
      toast.success(`${r.total} qarzdor keshlandi`);
    } finally {
      setBusy(null);
    }
  };

  const snapshot = async () => {
    setBusy("snapshot");
    try {
      await downloadFullSnapshot();
      toast.success(t("common.download") + " ✓");
    } catch {
      toast.error(t("common.error"));
    } finally {
      setBusy(null);
    }
  };

  const clearCache = () => {
    clearDebtorsCache();
    setCacheAt(null);
    setCacheCount(0);
    toast.success(t("settings.cache.clear") + " ✓");
  };

  return (
    <div>
      <PageHeader
        title={t("settings.title")}
        description="Brending, til va backup"
        showBranchFilter={false}
      />

      {isLoading ? (
        <div className="text-muted-foreground">{t("common.loading")}</div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {/* ----- Brending ----- */}
          <Card>
            <CardHeader>
              <CardTitle>Brending</CardTitle>
              <CardDescription>{t("settings.systemName")}, {t("settings.logo")}, {t("settings.color")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t("settings.systemName")}</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t("settings.systemSubtitle")}</Label>
                <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t("settings.color")}</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="size-10 rounded border"
                  />
                  <Input
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="font-mono"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t("settings.logo")}</Label>
                <div className="flex items-center gap-3">
                  {logo ? (
                    <img
                      src={logo}
                      alt="logo"
                      className="size-16 rounded object-contain border bg-white"
                    />
                  ) : (
                    <div className="size-16 rounded border grid place-items-center text-xs text-muted-foreground bg-muted">
                      —
                    </div>
                  )}
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files && onUpload(e.target.files[0])}
                    />
                    <span className="inline-flex items-center gap-2 px-3 py-2 rounded-md border text-sm hover:bg-accent">
                      <Upload className="size-4" />
                      {t("common.add")}
                    </span>
                  </label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Maks 2 MB. PNG/JPEG/SVG.
                </p>
              </div>
              <div className="flex justify-end pt-2">
                <Button onClick={save} disabled={update.isPending}>
                  <Save className="size-4" />
                  {t("common.save")}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* ----- Til ----- */}
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.language")}</CardTitle>
              <CardDescription>
                Interfeys tilini tanlang (4 til). Tanlov brauzeringizda saqlanadi.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LangSwitcher />
            </CardContent>
          </Card>

          {/* ----- Backup / snapshot ----- */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-emerald-500" />
                {t("settings.backup.title")}
              </CardTitle>
              <CardDescription>{t("settings.backup.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                {/* Snapshot */}
                <div className="rounded-lg border p-3 space-y-2">
                  <div className="font-medium text-sm">JSON snapshot</div>
                  <p className="text-xs text-muted-foreground">
                    Barcha mijozlar, qarzlar, to'lovlar va filiallarni o'z ichiga olgan
                    to'liq fayl. Server ishlamay qolsa ham, fayl orqali ma'lumotlarni
                    ko'rib turishingiz mumkin.
                  </p>
                  <Button onClick={snapshot} disabled={busy === "snapshot"} className="w-full">
                    <Download className="size-4" />
                    {t("settings.backup.download")}
                  </Button>
                </div>

                {/* Brauzer keshi */}
                <div className="rounded-lg border p-3 space-y-2">
                  <div className="font-medium text-sm">{t("settings.cache.label")}</div>
                  <p className="text-xs text-muted-foreground">
                    Qarzdorlar ro'yxati shu brauzerda lokal saqlanadi. Server ishlamasa
                    keshdagi nusxa ko'rinadi.
                  </p>
                  <div className="text-xs text-muted-foreground">
                    {cacheAt ? (
                      <>
                        Oxirgi yangilangan: <strong>{new Date(cacheAt).toLocaleString()}</strong>
                        {" — "}
                        {cacheCount} {t("nav.clients").toLowerCase()}
                      </>
                    ) : (
                      <>{t("settings.cache.never")}</>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={refreshCache}
                      disabled={busy === "refresh"}
                      className="flex-1"
                    >
                      <RefreshCw className={`size-4 ${busy === "refresh" ? "animate-spin" : ""}`} />
                      {t("common.refresh")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearCache}
                      disabled={!cacheAt}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="text-xs text-muted-foreground bg-muted/50 rounded p-3">
                <strong>💡 Maslahat:</strong> Hafta-oyda bir marta snapshot fayllaridan
                yuklab oling va ularni ishonchli joyga (Google Drive, USB, va h.k.) saqlang.
                Bu — server pul to'lanmaganda yoki uzilganda ma'lumotlar yo'qolmasligi
                uchun eng ishonchli usul.
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
