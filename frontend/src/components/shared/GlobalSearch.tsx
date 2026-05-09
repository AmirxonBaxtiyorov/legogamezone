import { useState } from "react";
import { Search, AlertTriangle, Ban } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";
import { formatMoney } from "@/lib/format";

import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ClientLite } from "@/types/api";

export function GlobalSearch() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["global-search", q],
    queryFn: async () => {
      const r = await api.get<{ items: ClientLite[] }>("/search/clients", {
        params: { q, limit: 20 },
      });
      return r.data.items;
    },
    enabled: q.length >= 2,
  });

  return (
    <div className="relative w-full max-w-md">
      <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <Input
        className="pl-9"
        placeholder="Mijoz, telefon..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
      />
      {open && q.length >= 2 && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-sm text-muted-foreground">Qidirilmoqda...</div>
          ) : !data || data.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">Topilmadi</div>
          ) : (
            <div className="py-1">
              {data.map((c) => (
                <button
                  key={c.id}
                  className="w-full text-left px-4 py-2 hover:bg-accent flex items-center justify-between gap-2 transition-colors"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setQ("");
                    setOpen(false);
                  }}
                >
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {c.name}
                      {c.isBlacklisted && (
                        <Badge variant="destructive" className="gap-1">
                          <Ban className="size-3" /> qora ro'yxat
                        </Badge>
                      )}
                      {c.hasOverdue && (
                        <Badge variant="warning" className="gap-1">
                          <AlertTriangle className="size-3" /> kechikkan
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {c.phone}
                      {c.branch && ` · ${c.branch}`}
                    </div>
                  </div>
                  {c.totalRemaining ? (
                    <span className="text-sm font-medium text-orange-500">
                      {formatMoney(c.totalRemaining)}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
