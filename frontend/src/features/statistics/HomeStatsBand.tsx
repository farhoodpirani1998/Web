import { Building2, GraduationCap, Smile, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Container } from "@/shared/design-system/components";
import { useCountUp } from "@/shared/hooks/useCountUp";
import { toPersianDigits } from "@/shared/utils/toPersianDigits";

/**
 * Homepage "Stats" band (Website Frontend Architecture §4, §10
 * "Section Architecture", §11 "Component Hierarchy") — shown directly
 * under `Hero` on the homepage only.
 *
 * Distinct from `StatisticsGrid`/`StatisticsHero` (the dedicated
 * `/statistics` page's feature components, same `statistics` feature
 * folder): this is a compact 4-figure promotional band, not the full
 * figures directory. Both live in `statistics` because they're the
 * same content domain (§30/§32 — other features/pages still only ever
 * import from this feature's `index.ts`, never reach into
 * `HomeStatsBand` internals directly).
 *
 * Visual-refresh pass (matching the approved mockup): a light card —
 * `bg-card`, rounded, ringed, gently overlapping `Hero`'s bottom edge —
 * replacing the earlier full-bleed dark `bg-primary` strip. Each
 * figure now pairs an icon (in a soft gold-tinted circle, no new
 * colors beyond the existing brand tokens) with its number/label,
 * echoing the icon-badge language `Header`/`Hero`/`Features` already
 * use, rather than bare centered numbers on a dark band. Still built
 * only from the existing `Container` primitive plus the shared
 * `useCountUp` hook — no new dependency, no new shared component.
 *
 * Real figures are ultimately Statistics content-module data (§4,
 * §8); this renders frontend-owned Persian placeholder figures in the
 * meantime, the same convention already used by `StatisticsGrid`.
 *
 * Rendered full-bleed *outside* `HomePage`'s `PageLayout` so the
 * overlap margin can reach up into `Hero`, the same reasoning as
 * `Hero` itself (see `HomePage.tsx`).
 */
const stats: ReadonlyArray<{
  id: string;
  value: number;
  suffix: string;
  label: string;
  icon: LucideIcon;
}> = [
  { id: "satisfaction", value: 98, suffix: "٪", label: "رضایت دانش‌آموزان", icon: Smile },
  { id: "students", value: 3200, suffix: "+", label: "دانش‌آموز فعال", icon: Users },
  { id: "courses", value: 120, suffix: "+", label: "دوره آموزشی", icon: GraduationCap },
  { id: "staff", value: 45, suffix: "+", label: "استاد مجرب", icon: Building2 },
];

export function HomeStatsBand() {
  return (
    <section aria-label="آمار مجموعه" className="relative z-10 bg-transparent">
      <Container size="xl" className="-mt-10 sm:-mt-14">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-border/70 shadow-lg ring-1 ring-border/60 md:grid-cols-4">
          {stats.map((stat) => (
            <StatItem
              key={stat.id}
              icon={stat.icon}
              value={stat.value}
              suffix={stat.suffix}
              label={stat.label}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}

function StatItem({
  icon: Icon,
  value,
  suffix,
  label,
}: {
  icon: LucideIcon;
  value: number;
  suffix: string;
  label: string;
}) {
  const { count, ref } = useCountUp(value);

  return (
    <div ref={ref} className="flex items-center gap-3 bg-card px-5 py-6 sm:gap-4 sm:px-7">
      <span
        aria-hidden="true"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold sm:h-12 sm:w-12"
      >
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </span>
      <div className="min-w-0">
        <div className="text-xl font-bold tracking-tight text-brand-navy sm:text-2xl">
          {toPersianDigits(count)}
          {suffix}
        </div>
        <div className="truncate text-[11px] font-semibold text-muted-foreground sm:text-xs">
          {label}
        </div>
      </div>
    </div>
  );
}
