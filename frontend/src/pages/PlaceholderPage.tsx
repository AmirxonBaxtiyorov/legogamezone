import { Construction } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PlaceholderPage({ title, description }: { title: string; description?: string }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Construction className="size-5" />
            Ushbu bo'lim quriliyapti
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Bu sahifa keyingi bosqichlarda to'liq ishga tushadi. Hozircha barcha funksionallikni
          asosiy dashboard'da yoki vanilla JS dashboard'da topishingiz mumkin
          (<code className="text-xs">backend/public/index.html</code>).
        </CardContent>
      </Card>
    </div>
  );
}
