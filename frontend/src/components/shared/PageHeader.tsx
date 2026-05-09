import type { ReactNode } from "react";
import { BranchFilter } from "./BranchFilter";

export function PageHeader({
  title,
  description,
  actions,
  showBranchFilter = true,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  showBranchFilter?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        {showBranchFilter && <BranchFilter />}
        {actions}
      </div>
    </div>
  );
}
