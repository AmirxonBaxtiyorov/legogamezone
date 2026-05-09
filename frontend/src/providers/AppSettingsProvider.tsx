// Tizim sozlamalari (brand, logo, rang) ni butun ilova bo'ylab tarqatadi.
// Settings sahifasida saqlanganda darhol qayta yuklanadi.

import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";

export interface AppBranding {
  systemName: string;
  systemSubtitle: string;
  primaryColor: string | null;
  logo: string | null;
  twoFactorOwner: boolean;
}

const DEFAULTS: AppBranding = {
  systemName: "Game Zone Qarz",
  systemSubtitle: "Boshqaruv tizimi",
  primaryColor: null,
  logo: null,
  twoFactorOwner: false,
};

const Ctx = createContext<AppBranding>(DEFAULTS);

type SettingsMap = Record<string, { value: string; type: string }>;

// hex (#RRGGBB) ni HSL "h s% l%" formatga (Tailwind CSS o'zgaruvchi formati uchun)
function hexToHsl(hex: string): string | null {
  const m = hex.replace("#", "").match(/^([0-9a-f]{6})$/i);
  if (!m) return null;
  const r = parseInt(m[1].slice(0, 2), 16) / 255;
  const g = parseInt(m[1].slice(2, 4), 16) / 255;
  const b = parseInt(m[1].slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
  }
  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const { data } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const r = await api.get<SettingsMap>("/settings");
      return r.data;
    },
    staleTime: 60_000,
    // Public endpoint — auth talab qilmaydi (settings ham shunday yozilgan)
  });

  const branding: AppBranding = data
    ? {
        systemName: data.systemName?.value || DEFAULTS.systemName,
        systemSubtitle: data.systemSubtitle?.value || DEFAULTS.systemSubtitle,
        primaryColor: data.primaryColor?.value || null,
        logo: data.logo?.value || null,
        twoFactorOwner: data.twoFactorOwner?.value === "1",
      }
    : DEFAULTS;

  // Document title
  useEffect(() => {
    if (branding.systemName) document.title = branding.systemName;
  }, [branding.systemName]);

  // Asosiy rang CSS o'zgaruvchisiga (Tailwind --primary)
  useEffect(() => {
    const root = document.documentElement;
    if (branding.primaryColor) {
      const hsl = hexToHsl(branding.primaryColor);
      if (hsl) {
        root.style.setProperty("--primary", hsl);
        root.style.setProperty("--ring", hsl);
      }
    } else {
      root.style.removeProperty("--primary");
      root.style.removeProperty("--ring");
    }
  }, [branding.primaryColor]);

  return <Ctx.Provider value={branding}>{children}</Ctx.Provider>;
}

export function useAppSettings(): AppBranding {
  return useContext(Ctx);
}

// Kichik komponent — logo yoki "GZ" badge ni renderlaydi.
export function AppBrandLogo({ size = 32, className = "" }: { size?: number; className?: string }) {
  const { logo, systemName } = useAppSettings();
  const initials = systemName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "GZ";
  if (logo) {
    return (
      <img
        src={logo}
        alt={systemName}
        width={size}
        height={size}
        className={`object-contain rounded-md ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className={`rounded-md bg-primary text-primary-foreground grid place-items-center font-bold ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials}
    </div>
  );
}
