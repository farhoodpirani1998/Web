import { Container } from "@/shared/design-system/components";
import { useCountUp } from "@/shared/hooks/useCountUp";
import { toPersianDigits } from "@/shared/utils/toPersianDigits";

/**
 * Homepage "Stats" band (Website Frontend Architecture §4, §10
 * "Section Architecture", §11 "Component Hierarchy") — the approved
 * Figma design's full-bleed `bg-primary` stats strip with count-up
 * numbers, shown directly under `Hero` on the homepage only.
 *
 * Distinct from `StatisticsGrid`/`StatisticsHero` (the dedicated
 * `/statistics` page's feature components, same `statistics` feature
 * folder): this is a compact 4-figure promotional band, not the full
 * figures directory, and uses a different visual treatment (full-bleed
 * navy strip vs. the `/statistics` page's card grid). Both live in
 * `statistics` because they're the same content domain (§30/§32 —
 * other features/pages still only ever import from this feature's
 * `index.ts`, never reach into `HomeStatsBand` internals directly).
 *
 * Presentation only, built from the existing `Container` primitive
 * plus the shared `useCountUp` hook (ported from Figma's inline hook
 * into `shared/hooks`, since more than one place could reasonably use
 * a count-up number). Real figures are ultimately Statistics
 * content-module data (§4, §8); this renders frontend-owned Persian
 * placeholder figures in the meantime, the same convention already
 * used by `StatisticsGrid`.
 *
 * Rendered full-bleed *outside* `HomePage`'s `PageLayout`, the same
 * reasoning as `Hero` (see `HomePage.tsx`).
 */
const stats = [
  { id: "campuses", value: 4, suffix: "+", label: "شعبه فعال" },
  { id: "students", value: 3500, suffix: "+", label: "دانش‌آموز" },
  { id: "staff", value: 220, suffix: "+", label: "عضو کادر آموزشی" },
  { id: "years", value: 20, suffix: "+", label: "سال سابقه" },
] as const;

export function HomeStatsBand() {
  return (
    <section aria-label="آمار مجموعه" className="bg-primary">
      <Container size="xl" className="grid grid-cols-2 gap-px bg-white/8 md:grid-cols-4">
        {stats.map((stat) => (
          <StatItem key={stat.id} value={stat.value} suffix={stat.suffix} label={stat.label} />
        ))}
      </Container>
    </section>
  );
}

function StatItem({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const { count, ref } = useCountUp(value);

  return (
    <div ref={ref} className="bg-primary px-6 py-10 text-center">
      <div className="mb-2 text-4xl font-bold tracking-tight text-accent md:text-5xl">
        {toPersianDigits(count)}
        {suffix}
      </div>
      <div className="text-[11px] font-semibold text-white/40">{label}</div>
    </div>
  );
}
