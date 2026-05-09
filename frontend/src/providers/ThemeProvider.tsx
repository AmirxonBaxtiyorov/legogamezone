// Theme provider — light/dark/system, localStorage'da saqlanadi.

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type Theme = "light" | "dark" | "system";

interface ThemeCtx {
  theme: Theme;
  effective: "light" | "dark";
  setTheme: (t: Theme) => void;
}

const Ctx = createContext<ThemeCtx | null>(null);
const STORAGE_KEY = "gz-theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return "system";
    return (localStorage.getItem(STORAGE_KEY) as Theme) || "system";
  });
  const [effective, setEffective] = useState<"light" | "dark">("light");

  useEffect(() => {
    const root = document.documentElement;
    const apply = (t: Theme) => {
      const sysDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const eff = t === "system" ? (sysDark ? "dark" : "light") : t;
      setEffective(eff);
      root.classList.toggle("dark", eff === "dark");
    };
    apply(theme);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => theme === "system" && apply("system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const setTheme = (t: Theme) => {
    localStorage.setItem(STORAGE_KEY, t);
    setThemeState(t);
  };

  return <Ctx.Provider value={{ theme, effective, setTheme }}>{children}</Ctx.Provider>;
}

export function useTheme() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useTheme: ThemeProvider ichida ishlatilishi kerak");
  return v;
}
