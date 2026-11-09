/**
 * Campus admin page — map view showing active branches.
 */
import { useCampuses } from "@/features/cms/campuses";
import { CampusMapEmbed } from "@/features/cms/campuses/CampusMap";
import { PageContainer } from "@/components/ui/PageContainer";
import { PageHeader } from "@/components/ui/PageHeader";
import { Breadcrumb } from "@/components/ui/Breadcrumb";

export function CampusPage() {
  const { campuses } = useCampuses();
  const active = campuses?.filter((c) => c.status === "published") ?? [];

  return (
    <PageContainer>
      <Breadcrumb items={[{ label: "داشبورد" }, { label: "پردیس‌ها" }]} />
      <PageHeader title="نقشه پردیس‌ها" description="شعبات فعال و موقعیت جغرافیایی." />
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {active.slice(0, 3).map((c) => (
            <div key={c.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="font-heading font-bold text-slate-900">{c.title.fa}</h3>
              <p className="text-sm text-slate-500">{c.address?.fa ?? "—"}</p>
              <p className="text-xs text-slate-400">{c.phone ?? c.email ?? "—"}</p>
              <div className="mt-3">
                <CampusMapEmbed mapUrl={c.mapUrl} title={c.title.fa} />
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-brand-navy/10 bg-[#F5F7FA] p-4 shadow-[0_4px_24px_rgba(15,45,82,0.06)]">
          <h2 className="font-heading text-lg font-bold text-brand-navy">نقشه کلی شعبات فعال</h2>
          <p className="text-sm text-slate-500">هر پردیس با نقشه اختصاصی نشان داده شده است.</p>
        </div>
      </div>
    </PageContainer>
  );
}
