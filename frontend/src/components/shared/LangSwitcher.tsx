// Til o'zgartirgich — header va sozlamalarda ishlatiladi.
// Tanlov localStorage'da saqlanadi va darhol qo'llanadi.

import { Globe } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LANGS, useLangStore, type Lang } from "@/lib/i18n";

export function LangSwitcher({ compact = false }: { compact?: boolean }) {
  const lang = useLangStore((s) => s.lang);
  const setLang = useLangStore((s) => s.setLang);

  return (
    <Select value={lang} onValueChange={(v) => setLang(v as Lang)}>
      <SelectTrigger
        className={compact ? "h-9 w-[60px] px-2" : "w-[170px]"}
        title="Til / Language"
      >
        {compact ? (
          <span className="flex items-center gap-1 text-xs font-semibold">
            <Globe className="size-3.5" />
            {LANGS.find((l) => l.code === lang)?.short ?? "UZ"}
          </span>
        ) : (
          <SelectValue />
        )}
      </SelectTrigger>
      <SelectContent>
        {LANGS.map((l) => (
          <SelectItem key={l.code} value={l.code}>
            <span className="flex items-center gap-2">
              <span className="font-mono text-xs w-7">{l.short}</span>
              {l.name}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
