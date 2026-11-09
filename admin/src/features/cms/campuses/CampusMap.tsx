export function CampusMapEmbed({
  mapUrl,
  latitude,
  longitude,
  title,
}: {
  mapUrl?: string;
  latitude?: number;
  longitude?: number;
  title?: string;
}) {
  const src =
    mapUrl ||
    (latitude !== undefined && longitude !== undefined
      ? `https://www.google.com/maps?q=${latitude},${longitude}&output=embed`
      : undefined);
  if (!src) return <p className="text-xs text-slate-400">نقشه در دسترس نیست</p>;
  return (
    <div className="w-full rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-white" dir="rtl">
      <div className="bg-brand-navy px-3 py-2 text-white text-sm font-heading font-bold">{title ?? "موقعیت پردیس"}</div>
      <iframe
        title={title ?? "نقشه"}
        src={src}
        width="100%"
        height="320"
        style={{ border: 0, display: "block" }}
        loading="lazy"
        allowFullScreen
      />
    </div>
  );
}
