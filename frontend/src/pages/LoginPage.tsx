import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Lock } from "lucide-react";

import { api, getErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { useAppSettings, AppBrandLogo } from "@/providers/AppSettingsProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { LangSwitcher } from "@/components/shared/LangSwitcher";
import { useT } from "@/lib/i18n";

const loginSchema = z.object({
  username: z.string().min(1, "login.required.username"),
  password: z.string().min(1, "login.required.password"),
  remember: z.boolean().optional(),
});
type LoginFormValues = z.infer<typeof loginSchema>;

type AuthUserResp = {
  id: number;
  username: string;
  fullName: string;
  role: "owner" | "admin";
  branchId: number | null;
  branchName: string | null;
};

export function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const branding = useAppSettings();
  const { t } = useT();

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "", remember: false },
  });

  const onLogin = async (values: LoginFormValues) => {
    try {
      const { data } = await api.post<{ token: string; user: AuthUserResp }>(
        "/login",
        values,
      );
      setAuth(data.token, data.user);
      navigate("/dashboard", { replace: true });
      toast.success(`${t("login.welcome")}, ${data.user.fullName}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="min-h-screen grid place-items-center p-4 bg-gradient-to-br from-background to-muted">
      <div className="w-full max-w-md space-y-3">
        <div className="flex justify-end">
          <LangSwitcher />
        </div>
        <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <AppBrandLogo size={48} />
            <div className="min-w-0">
              <CardTitle className="truncate">{branding.systemName}</CardTitle>
              <CardDescription className="truncate">
                {branding.systemSubtitle || t("login.title")}
              </CardDescription>
            </div>
            <Lock className="size-4 text-muted-foreground ml-auto" />
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">{t("login.username")}</Label>
              <Input
                id="username"
                autoComplete="username"
                autoFocus
                {...loginForm.register("username")}
              />
              {loginForm.formState.errors.username && (
                <p className="text-xs text-destructive">
                  {t(loginForm.formState.errors.username.message ?? "", loginForm.formState.errors.username.message)}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("login.password")}</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                {...loginForm.register("password")}
              />
              {loginForm.formState.errors.password && (
                <p className="text-xs text-destructive">
                  {t(loginForm.formState.errors.password.message ?? "", loginForm.formState.errors.password.message)}
                </p>
              )}
            </div>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input type="checkbox" {...loginForm.register("remember")} />
              {t("login.remember")}
            </label>
            <Button
              type="submit"
              className="w-full"
              disabled={loginForm.formState.isSubmitting}
            >
              {loginForm.formState.isSubmitting && (
                <Loader2 className="size-4 animate-spin" />
              )}
              {t("login.submit")}
            </Button>
          </form>
        </CardContent>
        </Card>
      </div>
    </div>
  );
}
