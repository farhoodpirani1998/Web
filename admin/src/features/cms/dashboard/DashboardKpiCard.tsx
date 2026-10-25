import { type LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/cn";

/**
 * A single KPI count card on the Dashboard: an icon chip, the count, and
 * a label, with a brand-colored accent bar. `accent` picks the chip tint
 * + bar color so a row of KPIs reads as a set of distinct metrics.
 */
export type KpiAccent = "navy" | "gold" | "sky" | "emerald";

const ACCENTS: Record<KpiAccent, { chip: string; bar: string }> = {
  navy: { chip: "bg-primary/10 text-primary", bar: "bg-primary" },
  gold: { chip: "bg-brand-gold/15 text-brand-gold", bar: "bg-brand-gold" },
  sky: { chip: "bg-sky-500/10 text-sky-600", bar: "bg-sky-500" },
  emerald: { chip: "bg-success/10 text-success", bar: "bg-success" },
};

export interface DashboardKpiCardProps {
  label: string;
  /** `null` when this count's fetch failed — rendered as "—" rather than 0, so a failed count is never confused with a real zero. */
  value: number | null;
  isLoading: boolean;
  icon: LucideIcon;
  accent: KpiAccent;
}

export function DashboardKpiCard({
  label,
  value,
  isLoading,
  icon: Icon,
  accent,
}: DashboardKpiCardProps) {
  const tone = ACCENTS[accent];

  return (
    <Card interactive className="relative overflow-hidden p-5">
      <span aria-hidden="true" className={cn("absolute inset-y-0 end-0 w-1", tone.bar)} />

      <span
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-xl",
          tone.chip,
        )}
      >
        <Icon className="h-5 w-5" />
      </span>

      <p className="mt-4 font-heading text-3xl font-extrabold tabular-nums text-foreground">
        {isLoading ? <Skeleton className="h-8 w-16" /> : (value ?? "—")}
      </p>

      <p className="mt-1 text-sm font-medium text-muted-foreground">{label}</p>
    </Card>
  );
}
