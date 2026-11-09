import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";

import { useMediaById } from "@/features/cms/media";
import { toEnglishDigits, toPersianDigits } from "@/lib/toPersianDigits";

import type {
  CmsAboutSection,
  CmsAboutSections,
  CmsAboutStatItem,
  CmsAboutTeamMember,
  CmsAboutTimelineItem,
  CmsAboutValueItem,
} from "./types";
import type { Translatable } from "../types";

interface AboutSectionsEditorProps {
  sections: CmsAboutSections;
  disabled: boolean;
  onChange: (sections: CmsAboutSections) => void;
  onChooseTeamImage: (memberId: string) => void;
  onClearTeamImage: (memberId: string) => void;
}

export function AboutSectionsEditor({
  sections,
  disabled,
  onChange,
  onChooseTeamImage,
  onClearTeamImage,
}: AboutSectionsEditorProps) {
  const stats = sections.stats ?? { items: [] };
  const values = sections.values ?? { items: [] };
  const timeline = sections.timeline ?? { items: [] };
  const team = sections.team ?? { items: [] };
  const faq = sections.faq ?? {};

  function setStats(update: Partial<CmsAboutSection<CmsAboutStatItem>>) {
    onChange({ ...sections, stats: { ...stats, ...update } });
  }

  function setValues(update: Partial<CmsAboutSection<CmsAboutValueItem>>) {
    onChange({ ...sections, values: { ...values, ...update } });
  }

  function setTimeline(
    update: Partial<CmsAboutSection<CmsAboutTimelineItem>>,
  ) {
    onChange({ ...sections, timeline: { ...timeline, ...update } });
  }

  function setTeam(update: Partial<CmsAboutSection<CmsAboutTeamMember>>) {
    onChange({ ...sections, team: { ...team, ...update } });
  }

  return (
    <div className="flex flex-col gap-4">
      <SectionFieldset
        title="آمار"
        section={stats}
        disabled={disabled}
        onChange={setStats}
      >
        {(stats.items ?? []).map((item, index) => (
          <ItemCard
            key={item.id}
            title="آمار"
            index={index}
            count={stats.items?.length ?? 0}
            disabled={disabled}
            onMove={(direction) =>
              setStats({ items: moveItem(stats.items ?? [], index, direction) })
            }
            onRemove={() =>
              setStats({
                items: (stats.items ?? []).filter(
                  (entry) => entry.id !== item.id,
                ),
              })
            }
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField
                label="مقدار عددی"
                value={toPersianDigits(item.value)}
                disabled={disabled}
                dir="ltr"
                inputMode="decimal"
                onChange={(value) =>
                  updateStat(item.id, {
                    value: toEnglishDigits(value).replace(/[,\u066c\s]/gi, ""),
                  })
                }
              />
              <TextField
                label="پسوند (اختیاری؛ مانند + یا ٪)"
                value={item.suffix ?? ""}
                disabled={disabled}
                onChange={(suffix) => updateStat(item.id, { suffix })}
              />
            </div>
            <LocalizedField
              label="برچسب آمار"
              value={item.label}
              disabled={disabled}
              onChange={(label) => updateStat(item.id, { label })}
            />
          </ItemCard>
        ))}
        <AddItemButton
          label="افزودن آمار"
          disabled={disabled}
          onClick={() =>
            setStats({
              items: [
                ...(stats.items ?? []),
                {
                  id: crypto.randomUUID(),
                  value: "",
                  label: { fa: "" },
                },
              ],
            })
          }
        />
      </SectionFieldset>

      <SectionFieldset
        title="ارزش‌ها"
        section={values}
        disabled={disabled}
        onChange={setValues}
      >
        {(values.items ?? []).map((item, index) => (
          <ItemCard
            key={item.id}
            title="ارزش"
            index={index}
            count={values.items?.length ?? 0}
            disabled={disabled}
            onMove={(direction) =>
              setValues({
                items: moveItem(values.items ?? [], index, direction),
              })
            }
            onRemove={() =>
              setValues({
                items: (values.items ?? []).filter(
                  (entry) => entry.id !== item.id,
                ),
              })
            }
          >
            <LocalizedField
              label="عنوان ارزش"
              value={item.title}
              disabled={disabled}
              onChange={(title) => updateValue(item.id, { title })}
            />
            <LocalizedField
              label="توضیح"
              value={item.description}
              multiline
              disabled={disabled}
              onChange={(description) =>
                updateValue(item.id, { description })
              }
            />
          </ItemCard>
        ))}
        <AddItemButton
          label="افزودن ارزش"
          disabled={disabled}
          onClick={() =>
            setValues({
              items: [
                ...(values.items ?? []),
                {
                  id: crypto.randomUUID(),
                  title: { fa: "" },
                  description: { fa: "" },
                },
              ],
            })
          }
        />
      </SectionFieldset>

      <SectionFieldset
        title="مسیر رشد"
        section={timeline}
        disabled={disabled}
        onChange={setTimeline}
      >
        {(timeline.items ?? []).map((item, index) => (
          <ItemCard
            key={item.id}
            title="رویداد"
            index={index}
            count={timeline.items?.length ?? 0}
            disabled={disabled}
            onMove={(direction) =>
              setTimeline({
                items: moveItem(timeline.items ?? [], index, direction),
              })
            }
            onRemove={() =>
              setTimeline({
                items: (timeline.items ?? []).filter(
                  (entry) => entry.id !== item.id,
                ),
              })
            }
          >
            <TextField
              label="سال (شمسی)"
              value={toPersianDigits(item.year)}
              disabled={disabled}
              inputMode="numeric"
              onChange={(year) =>
                updateTimeline(item.id, { year: toEnglishDigits(year) })
              }
            />
            <LocalizedField
              label="عنوان رویداد"
              value={item.title}
              disabled={disabled}
              onChange={(title) => updateTimeline(item.id, { title })}
            />
            <LocalizedField
              label="توضیح"
              value={item.description}
              multiline
              disabled={disabled}
              onChange={(description) =>
                updateTimeline(item.id, { description })
              }
            />
          </ItemCard>
        ))}
        <AddItemButton
          label="افزودن رویداد"
          disabled={disabled}
          onClick={() =>
            setTimeline({
              items: [
                ...(timeline.items ?? []),
                {
                  id: crypto.randomUUID(),
                  year: "",
                  title: { fa: "" },
                  description: { fa: "" },
                },
              ],
            })
          }
        />
      </SectionFieldset>

      <SectionFieldset
        title="اعضای تیم"
        section={team}
        disabled={disabled}
        onChange={setTeam}
      >
        {(team.items ?? []).map((item, index) => (
          <ItemCard
            key={item.id}
            title="عضو تیم"
            index={index}
            count={team.items?.length ?? 0}
            disabled={disabled}
            onMove={(direction) =>
              setTeam({ items: moveItem(team.items ?? [], index, direction) })
            }
            onRemove={() =>
              setTeam({
                items: (team.items ?? []).filter(
                  (entry) => entry.id !== item.id,
                ),
              })
            }
          >
            <LocalizedField
              label="نام"
              value={item.name}
              disabled={disabled}
              onChange={(name) => updateTeamMember(item.id, { name })}
            />
            <LocalizedField
              label="سمت"
              value={item.role}
              disabled={disabled}
              onChange={(role) => updateTeamMember(item.id, { role })}
            />
            <TeamImageField
              mediaId={item.avatarMediaId}
              disabled={disabled}
              onChoose={() => onChooseTeamImage(item.id)}
              onClear={() => onClearTeamImage(item.id)}
            />
          </ItemCard>
        ))}
        <AddItemButton
          label="افزودن عضو تیم"
          disabled={disabled}
          onClick={() =>
            setTeam({
              items: [
                ...(team.items ?? []),
                {
                  id: crypto.randomUUID(),
                  name: { fa: "" },
                  role: { fa: "" },
                },
              ],
            })
          }
        />
      </SectionFieldset>

      <SectionFieldset
        title="پرسش‌های متداول در صفحه درباره ما"
        section={faq}
        disabled={disabled}
        onChange={(update) => onChange({ ...sections, faq: { ...faq, ...update } })}
        showItems={false}
      />
    </div>
  );

  function updateStat(id: string, update: Partial<CmsAboutStatItem>) {
    setStats({
      items: (stats.items ?? []).map((item) =>
        item.id === id ? { ...item, ...update } : item,
      ),
    });
  }

  function updateValue(id: string, update: Partial<CmsAboutValueItem>) {
    setValues({
      items: (values.items ?? []).map((item) =>
        item.id === id ? { ...item, ...update } : item,
      ),
    });
  }

  function updateTimeline(
    id: string,
    update: Partial<CmsAboutTimelineItem>,
  ) {
    setTimeline({
      items: (timeline.items ?? []).map((item) =>
        item.id === id ? { ...item, ...update } : item,
      ),
    });
  }

  function updateTeamMember(id: string, update: Partial<CmsAboutTeamMember>) {
    setTeam({
      items: (team.items ?? []).map((item) =>
        item.id === id ? { ...item, ...update } : item,
      ),
    });
  }
}

function SectionFieldset<TItem>({
  title,
  section,
  disabled,
  onChange,
  showItems = true,
  children,
}: {
  title: string;
  section: CmsAboutSection<TItem> | { title?: Translatable<string>; description?: Translatable<string> };
  disabled: boolean;
  onChange: (
    update: Partial<CmsAboutSection<TItem> | { title?: Translatable<string>; description?: Translatable<string> }>,
  ) => void;
  showItems?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <fieldset className="flex flex-col gap-4 rounded-md border border-slate-200 p-3">
      <legend className="px-1 text-sm font-medium text-slate-900">{title}</legend>
      <LocalizedField
        label="عنوان بخش"
        value={section.title}
        disabled={disabled}
        onChange={(value) => onChange({ title: value })}
      />
      <LocalizedField
        label="توضیح بخش (اختیاری)"
        value={section.description}
        multiline
        disabled={disabled}
        onChange={(value) => onChange({ description: value })}
      />
      {showItems ? children : null}
    </fieldset>
  );
}

function LocalizedField({
  label,
  value,
  disabled,
  multiline = false,
  onChange,
}: {
  label: string;
  value?: Translatable<string>;
  disabled: boolean;
  multiline?: boolean;
  onChange: (value: Translatable<string>) => void;
}) {
  const english = value?.en ?? "";
  const sharedClass =
    "rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100";

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-900">
        <span>{label} (فارسی)</span>
        {multiline ? (
          <textarea
            dir="rtl"
            rows={3}
            value={value?.fa ?? ""}
            disabled={disabled}
            className={sharedClass}
            onChange={(event) =>
              onChange({ ...value, fa: event.target.value })
            }
          />
        ) : (
          <input
            dir="rtl"
            value={value?.fa ?? ""}
            disabled={disabled}
            className={sharedClass}
            onChange={(event) =>
              onChange({ ...value, fa: event.target.value })
            }
          />
        )}
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-900">
        <span>{label} (انگلیسی، اختیاری)</span>
        {multiline ? (
          <textarea
            dir="ltr"
            rows={3}
            value={english}
            disabled={disabled}
            className={sharedClass}
            onChange={(event) =>
              onChange({ ...value, fa: value?.fa ?? "", en: event.target.value })
            }
          />
        ) : (
          <input
            dir="ltr"
            value={english}
            disabled={disabled}
            className={sharedClass}
            onChange={(event) =>
              onChange({ ...value, fa: value?.fa ?? "", en: event.target.value })
            }
          />
        )}
      </label>
    </div>
  );
}

function TextField({
  label,
  value,
  disabled,
  dir = "rtl",
  inputMode,
  onChange,
}: {
  label: string;
  value: string;
  disabled: boolean;
  dir?: "rtl" | "ltr";
  inputMode?: "numeric" | "decimal";
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-900">
      <span>{label}</span>
      <input
        dir={dir}
        inputMode={inputMode}
        value={value}
        disabled={disabled}
        className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function ItemCard({
  title,
  index,
  count,
  disabled,
  onMove,
  onRemove,
  children,
}: {
  title: string;
  index: number;
  count: number;
  disabled: boolean;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-md border border-slate-200 p-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label={`انتقال ${title} به بالا`}
            disabled={disabled || index === 0}
            onClick={() => onMove(-1)}
            className="rounded p-1 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
          >
            <ChevronUp aria-hidden="true" size={16} />
          </button>
          <button
            type="button"
            aria-label={`انتقال ${title} به پایین`}
            disabled={disabled || index === count - 1}
            onClick={() => onMove(1)}
            className="rounded p-1 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
          >
            <ChevronDown aria-hidden="true" size={16} />
          </button>
          <button
            type="button"
            aria-label={`حذف ${title}`}
            disabled={disabled}
            onClick={onRemove}
            className="rounded p-1 text-red-600 hover:bg-red-50 disabled:opacity-40"
          >
            <Trash2 aria-hidden="true" size={16} />
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}

function AddItemButton({
  label,
  disabled,
  onClick,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex w-fit items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
    >
      <Plus aria-hidden="true" size={16} />
      {label}
    </button>
  );
}

function TeamImageField({
  mediaId,
  disabled,
  onChoose,
  onClear,
}: {
  mediaId?: string;
  disabled: boolean;
  onChoose: () => void;
  onClear: () => void;
}) {
  const { media, isLoading } = useMediaById(mediaId ?? null);

  return (
    <div className="flex items-center gap-3">
      <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-50">
        {mediaId && isLoading ? (
          <span className="text-xs text-slate-400">در حال بارگذاری…</span>
        ) : media ? (
          <img
            src={media.thumbnailUrl ?? media.url}
            alt={media.altText}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-xs text-slate-400">بدون تصویر</span>
        )}
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={onChoose}
          className="rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          {mediaId ? "تغییر تصویر" : "انتخاب تصویر"}
        </button>
        {mediaId ? (
          <button
            type="button"
            disabled={disabled}
            onClick={onClear}
            className="rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            حذف تصویر
          </button>
        ) : null}
      </div>
    </div>
  );
}

function moveItem<T>(items: T[], index: number, direction: -1 | 1): T[] {
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= items.length) return items;
  const next = [...items];
  [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
  return next;
}
