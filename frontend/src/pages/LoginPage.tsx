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

const loginSchema = z.object({
  username: z.string().min(1, "Login majburiy"),
  password: z.string().min(1, "Parol majburiy"),
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
      toast.success(`Xush kelibsiz, ${data.user.fullName}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="min-h-screen grid place-items-center p-4 bg-gradient-to-br from-background to-muted">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-3">
            <AppBrandLogo size={48} />
            <div className="min-w-0">
              <CardTitle className="truncate">{branding.systemName}</CardTitle>
              <CardDescription className="truncate">
                {branding.systemSubtitle || "Tizimga kirish"}
              </CardDescription>
            </div>
            <Lock className="size-4 text-muted-foreground ml-auto" />
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Login</Label>
              <Input
                id="username"
                autoComplete="username"
                autoFocus
                {...loginForm.register("username")}
              />
              {loginForm.formState.errors.username && (
                <p className="text-xs text-destructive">
                  {loginForm.formState.errors.username.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Parol</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                {...loginForm.register("password")}
              />
              {loginForm.formState.errors.password && (
                <p className="text-xs text-destructive">
                  {loginForm.formState.errors.password.message}
                </p>
              )}
            </div>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input type="checkbox" {...loginForm.register("remember")} />
              Meni eslab qol (30 kun)
            </label>
            <Button
              type="submit"
              className="w-full"
              disabled={loginForm.formState.isSubmitting}
            >
              {loginForm.formState.isSubmitting && (
                <Loader2 className="size-4 animate-spin" />
              )}
              Kirish
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
