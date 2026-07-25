import { useState, type FormEvent } from "react";

import type { CmsEventStatus } from "./types";

/**
 * All/Draft/Published/Archived filter for the events list, plus a
 * category text filter. `undefined` means "All" for status — that's
 * also exactly what `fetchEventsList`/`useEvents` expect for "no
 * status filter" (omitting the query param entirely, per
 * `EventsController.findAll`), so this component's status value type
 * doubles as the hook's param type with no translation step in
 * `EventsPage`, same convention as `features/cms/news/NewsStatusFilter.tsx`.
 *
 * The category filter exists here for the same reason it exists on
 * News: `EventsController.findAll` reads a real `category` query
 * param. It's a free-text field, not a dropdown: there's no "list
 * distinct categories" endpoint to populate one from (`category` is a
 * plain string column, not its own entity — see the entity's own doc
 * comment), so a text input mirrors what the backend actually accepts.
 *
 * No search box: `GET /admin/events` has no search param and this
 * module's constraints say not to invent one client-side.
 */
export interface EventStatusFilterProps {
  status: CmsEventStatus | undefined;
  onStatusChange: (value: CmsEventStatus | undefined) => void;
  category: string | undefined;
  onCategoryChange: (value: string | undefined) => void;
}

const STATUS_OPTIONS: { label: string; value: CmsEventStatus | undefined }[] = [
  { label: "All", value: undefined },
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
  { label: "Archived", value: "archived" },
];

export function EventStatusFilter({
  status,
  onStatusChange,
  category,
  onCategoryChange,
}: EventStatusFilterProps) {
  const [categoryInput, setCategoryInput] = useState(category ?? "");

  function handleCategorySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = categoryInput.trim();
    onCategoryChange(trimmed.length > 0 ? trimmed : undefined);
  }

  function handleClearCategory() {
    setCategoryInput("");
    onCategoryChange(undefined);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div
        role="tablist"
        aria-label="Filter events by status"
        className="inline-flex w-fit rounded-md border border-slate-200 bg-slate-50 p-0.5"
      >
        {STATUS_OPTIONS.map((option) => {
          const isActive = option.value === status;
          return (
            <button
              key={option.label}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onStatusChange(option.value)}
              className={`rounded px-3 py-1.5 text-sm font-medium transition ${
                isActive ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleCategorySubmit} className="flex items-center gap-2">
        <label htmlFor="event-category-filter" className="sr-only">
          Filter by category
        </label>
        <input
          id="event-category-filter"
          type="text"
          value={categoryInput}
          onChange={(event) => setCategoryInput(event.target.value)}
          placeholder="Filter by category…"
          className="w-40 rounded-md border border-slate-300 px-2.5 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
        />
        <button
          type="submit"
          className="rounded-md border border-slate-300 px-2.5 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Apply
        </button>
        {category ? (
          <button
            type="button"
            onClick={handleClearCategory}
            className="text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            Clear
          </button>
        ) : null}
      </form>
    </div>
  );
}
