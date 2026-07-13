/**
 * Placeholder root-route page.
 *
 * Phase 1 (Bootstrap Foundation) explicitly excludes Homepage/section
 * implementation (Hero, Stats, About, etc. — Website Frontend
 * Architecture §4, §10). This component only proves the route/layout/
 * provider wiring renders correctly; it composes no sections and fetches
 * no data.
 */
export function HomePage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="font-heading text-2xl font-semibold text-foreground">
        Frontend foundation is running
      </h1>
      <p className="max-w-md text-muted-foreground">
        This is a Phase 1 bootstrap placeholder. Site sections are
        implemented in later phases, one feature at a time.
      </p>
    </div>
  );
}
