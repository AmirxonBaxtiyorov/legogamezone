import { useEffect, useState } from "react";
import { Save, Upload } from "lucide-react";
import { toast } from "sonner";

import { useSettings, useUpdateSettings } from "@/hooks/useApi";

import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function SettingsPage() {
  const { data: settings, isLoading } = useSettings();
  const update = useUpdateSettings();

  const [name, setName] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#4f46e5");
  const [twoFactor, setTwoFactor] = useState(false);
  const [logo, setLogo] = useState<string | null>(null);

  useEffect(() => {
    if (!settings) return;
    setName(settings.systemName?.value ?? "Game Zone Qarz");
    setSubtitle(settings.systemSubtitle?.value ?? "");
    setPrimaryColor(settings.primaryColor?.value ?? "#4f46e5");
    setTwoFactor(settings.twoFactorOwner?.value === "1");
    setLogo(settings.logo?.value ?? null);
  }, [settings]);

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
      twoFactorOwner: twoFactor ? "1" : "0",
      ...(logo ? { logo } : {}),
    });
  };

  return (
    <div>
      <PageHeader title="Sozlamalar" description="Brending, 2FA va boshqalar" showBranchFilter={false} />

      {isLoading ? (
        <div className="text-muted-foreground">Yuklanmoqda...</div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Brending</CardTitle>
              <CardDescription>Tizim nomi, subtitle va logo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tizim nomi</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Qisqa tavsif</Label>
                <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Asosiy rang</Label>
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
                <Label>Logo</Label>
                <div className="flex items-center gap-3">
                  {logo ? (
                    <img
                      src={logo}
                      alt="logo"
                      className="size-16 rounded object-contain border bg-white"
                    />
                  ) : (
                    <div className="size-16 rounded border grid place-items-center text-xs text-muted-foreground bg-muted">
                      Logo yo'q
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
                      Yuklash
                    </span>
                  </label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Maks 2 MB. PNG/JPEG/SVG.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Xavfsizlik</CardTitle>
              <CardDescription>2FA va boshqa sozlamalar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <Label className="text-base">2FA owner uchun</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Telegramga 6-raqamli kod yuboriladi (login vaqtida)
                  </p>
                </div>
                <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-2 flex justify-end">
            <Button onClick={save} disabled={update.isPending}>
              <Save className="size-4" />
              Sozlamalarni saqlash
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
