/**
 * The "select all" checkbox used in list table headers
 * (`NewsList`/`PageList`/`TestimonialList`). Split out from those
 * because `indeterminate` isn't a real HTML attribute — it can only be
 * set imperatively on the checkbox's DOM node, which needs a `ref` +
 * `useEffect` most callers shouldn't have to repeat inline.
 */
import { useEffect, useRef } from "react";

export interface SelectAllCheckboxProps {
  checked: boolean;
  indeterminate: boolean;
  onChange: () => void;
  disabled?: boolean;
  "aria-label"?: string;
}

export function SelectAllCheckbox({
  checked,
  indeterminate,
  onChange,
  disabled,
  "aria-label": ariaLabel = "Select all rows",
}: SelectAllCheckboxProps) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      aria-label={ariaLabel}
      className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
    />
  );
}
