import { useCampuses } from "./hooks/useCampuses";

export interface CampusSelectProps {
  id: string;
  label: string;
  value: string;
  onChange: (campusId: string) => void;
  disabled?: boolean;
  sharedLabel?: string;
  className?: string;
}

/** Reusable named Campus selector; an empty selection means shared content. */
export function CampusSelect({
  id,
  label,
  value,
  onChange,
  disabled = false,
  sharedLabel = "محتوای مشترک",
  className = "w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900",
}: CampusSelectProps) {
  const { campuses, isLoading, error } = useCampuses();

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-slate-900">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled || isLoading}
        className={className}
      >
        <option value="">{sharedLabel}</option>
        {campuses.map((campus) => (
          <option key={campus.id} value={campus.id}>
            {campus.title.fa}
          </option>
        ))}
      </select>
      {error ? (
        <p role="status" className="text-xs text-amber-700">
          بارگذاری فهرست پردیس‌ها ناموفق بود؛ محتوای مشترک قابل انتخاب است.
        </p>
      ) : null}
    </div>
  );
}
