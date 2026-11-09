import { useCallback, useEffect, useState, type FormEvent } from "react";

import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageContainer } from "@/components/ui/PageContainer";
import { PageHeader } from "@/components/ui/PageHeader";
import { PermissionGate } from "@/components/ui/PermissionGate";
import { Section } from "@/components/ui/Section";
import { ApiError } from "@/lib/apiError";

import {
  createTextbook,
  deleteTextbook,
  fetchTextbookTaxonomies,
  fetchTextbooks,
  updateTextbook,
  updateTextbookStatus,
} from "./api";
import type {
  CmsTextbook,
  CmsTextbookSourceType,
  CmsTextbookStatus,
  CmsTextbookTaxonomy,
  CmsTextbookTaxonomyType,
  TextbookPayload,
} from "./types";

const STATUS_LABELS: Record<CmsTextbookStatus, string> = {
  draft: "پیش‌نویس",
  published: "منتشرشده",
  archived: "بایگانی‌شده",
};

function availableStatuses(
  sourceType: CmsTextbookSourceType,
  currentStatus: CmsTextbookStatus,
): CmsTextbookStatus[] {
  const statuses: CmsTextbookStatus[] = ["draft", "archived"];
  if (sourceType === "EXTERNAL_LINK" || currentStatus === "published") {
    statuses.splice(1, 0, "published");
  }
  return statuses;
}

const SOURCE_LABELS: Record<CmsTextbookSourceType, string> = {
  UPLOADED: "فایل بارگذاری‌شده",
  EXTERNAL_LINK: "پیوند بیرونی",
};

const TAXONOMY_LABELS: Record<CmsTextbookTaxonomyType, string> = {
  stage: "مقطع",
  grade: "پایه",
  field: "رشته",
  subject: "درس",
};

type BookForm = {
  title: string;
  code: string;
  stage: string;
  grade: string;
  field: string;
  subject: string;
  academicYear: string;
  sourceType: CmsTextbookSourceType;
  externalUrl: string;
  sourceAttribution: string;
  status: CmsTextbookStatus;
};

const EMPTY_FORM: BookForm = {
  title: "",
  code: "",
  stage: "",
  grade: "",
  field: "",
  subject: "",
  academicYear: "",
  sourceType: "UPLOADED",
  externalUrl: "",
  sourceAttribution: "",
  status: "draft",
};

const inputClass = "block w-full rounded-md border border-slate-300 px-3 py-2 text-sm";

function formValues(book: CmsTextbook | null): BookForm {
  if (!book) return { ...EMPTY_FORM };
  return {
    title: book.title.fa,
    code: book.code,
    stage: book.stage,
    grade: book.grade,
    field: book.field ?? "",
    subject: book.subject,
    academicYear: book.academicYear,
    sourceType: book.sourceType,
    externalUrl: book.externalUrl ?? "",
    sourceAttribution: book.sourceAttribution,
    status: book.status,
  };
}

function slugFrom(value: string): string {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || `textbook-${crypto.randomUUID()}`;
}

function asPayload(values: BookForm, book: CmsTextbook | null): TextbookPayload {
  return {
    title: { fa: values.title.trim() },
    slug: book?.slug ?? slugFrom(values.code),
    code: values.code.trim(),
    stage: values.stage.trim(),
    grade: values.grade.trim(),
    field: values.field.trim() || null,
    subject: values.subject.trim(),
    academicYear: values.academicYear.trim(),
    sourceType: values.sourceType,
    externalUrl: values.sourceType === "EXTERNAL_LINK" ? values.externalUrl.trim() : null,
    sourceAttribution: values.sourceAttribution.trim(),
  };
}

export function TextbooksPage() {
  const [books, setBooks] = useState<CmsTextbook[]>([]);
  const [taxonomies, setTaxonomies] = useState<CmsTextbookTaxonomy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CmsTextbook | null>(null);
  const [form, setForm] = useState<BookForm>({ ...EMPTY_FORM });
  const [isSaving, setIsSaving] = useState(false);
  const [busyBookId, setBusyBookId] = useState<string | null>(null);

  const loadBooks = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const result = await fetchTextbooks();
      setBooks(result.items);
    } catch (error) {
      setLoadError(
        error instanceof ApiError ? error.message : "بارگذاری کتاب‌ها انجام نشد.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBooks();
    void fetchTextbookTaxonomies()
      .then(setTaxonomies)
      .catch(() => setTaxonomies([]));
  }, [loadBooks]);

  function openForm(book: CmsTextbook | null = null) {
    setEditing(book);
    setForm(formValues(book));
    setActionError(null);
    setFormOpen(true);
  }

  async function saveBook(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setActionError(null);
    try {
      const payload = asPayload(form, editing);
      let saved: CmsTextbook;
      if (editing) {
        saved = await updateTextbook(editing.id, payload);
      } else {
        saved = await createTextbook(payload);
      }
      if (saved.status !== form.status) {
        saved = await updateTextbookStatus(saved.id, form.status);
      }
      setFormOpen(false);
      setEditing(null);
      await loadBooks();
    } catch (error) {
      setActionError(error instanceof ApiError ? error.message : "ذخیره کتاب انجام نشد.");
    } finally {
      setIsSaving(false);
    }
  }

  async function changeStatus(book: CmsTextbook, status: CmsTextbookStatus) {
    setBusyBookId(book.id);
    setActionError(null);
    try {
      const updated = await updateTextbookStatus(book.id, status);
      setBooks((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
    } catch (error) {
      setActionError(
        error instanceof ApiError ? error.message : "تغییر وضعیت کتاب انجام نشد.",
      );
    } finally {
      setBusyBookId(null);
    }
  }

  async function removeBook(book: CmsTextbook) {
    if (!window.confirm(`کتاب «${book.title.fa}» حذف شود؟`)) return;
    setBusyBookId(book.id);
    setActionError(null);
    try {
      await deleteTextbook(book.id);
      setBooks((current) => current.filter((item) => item.id !== book.id));
    } catch (error) {
      setActionError(error instanceof ApiError ? error.message : "حذف کتاب انجام نشد.");
    } finally {
      setBusyBookId(null);
    }
  }

  function taxonomyField(
    type: CmsTextbookTaxonomyType,
    value: string,
    onChange: (value: string) => void,
    required = false,
  ) {
    const options = taxonomies.filter((item) => item.type === type);
    if (!options.length) {
      return (
        <input
          className={inputClass}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required={required}
        />
      );
    }
    return (
      <select
        className={inputClass}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
      >
        <option value="">انتخاب {TAXONOMY_LABELS[type]}</option>
        {options.map((item) => (
          <option key={item.id} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    );
  }

  return (
    <PageContainer>
      <Breadcrumb items={[{ label: "داشبورد" }, { label: "کتاب‌های درسی" }]} />
      <PermissionGate
        permission="website.content:read"
        fallback={
          <>
            <PageHeader title="کتاب‌های درسی" />
            <Section>
              <EmptyState
                title="دسترسی ندارید"
                description="برای مشاهده کتاب‌ها به مجوز مشاهده محتوا نیاز دارید."
              />
            </Section>
          </>
        }
      >
        <PageHeader
          title="کتاب‌های درسی"
          description="مدیریت کتاب‌های درسی و منابع آموزشی."
        >
          <PermissionGate permission="website.content:write">
            <button
              type="button"
              onClick={() => openForm()}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              کتاب جدید
            </button>
          </PermissionGate>
        </PageHeader>
        <Section>
          {actionError ? (
            <p role="alert" className="mb-3 text-sm text-red-600">
              {actionError}
            </p>
          ) : null}
          {isLoading ? (
            <p role="status" className="py-6 text-center text-sm text-slate-500">
              در حال بارگذاری کتاب‌ها…
            </p>
          ) : null}
          {!isLoading && loadError ? (
            <div className="py-4 text-sm text-red-600" role="alert">
              {loadError}{" "}
              <button
                type="button"
                className="underline"
                onClick={() => void loadBooks()}
              >
                تلاش دوباره
              </button>
            </div>
          ) : null}
          {!isLoading && !loadError && books.length === 0 ? (
            <EmptyState
              title="کتابی ثبت نشده است"
              description="برای افزودن کتاب، از دکمه کتاب جدید استفاده کنید."
            />
          ) : null}
          {!isLoading && !loadError && books.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-right text-sm">
                <thead>
                  <tr className="border-b bg-slate-50 text-slate-600">
                    <th className="px-3 py-3">عنوان</th>
                    <th className="px-3 py-3">کد</th>
                    <th className="px-3 py-3">مقطع / پایه</th>
                    <th className="px-3 py-3">درس</th>
                    <th className="px-3 py-3">سال تحصیلی</th>
                    <th className="px-3 py-3">وضعیت</th>
                    <th className="px-3 py-3">عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map((book) => (
                    <tr key={book.id} className="border-b last:border-0">
                      <td className="px-3 py-3 font-medium">{book.title.fa}</td>
                      <td dir="ltr" className="px-3 py-3 text-right">
                        {book.code}
                      </td>
                      <td className="px-3 py-3">
                        {book.stage} / {book.grade}
                      </td>
                      <td className="px-3 py-3">{book.subject}</td>
                      <td className="px-3 py-3">{book.academicYear}</td>
                      <td className="px-3 py-3">
                        <PermissionGate
                          permission="website.content:publish"
                          fallback={<span>{STATUS_LABELS[book.status]}</span>}
                        >
                          <select
                            aria-label={`وضعیت ${book.title.fa}`}
                            className={inputClass}
                            value={book.status}
                            disabled={busyBookId === book.id}
                            onChange={(event) =>
                              void changeStatus(
                                book,
                                event.target.value as CmsTextbookStatus,
                              )
                            }
                          >
                            {availableStatuses(book.sourceType, book.status).map(
                              (value) => (
                                <option key={value} value={value}>
                                  {STATUS_LABELS[value]}
                                </option>
                              ),
                            )}
                          </select>
                        </PermissionGate>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3">
                        <PermissionGate permission="website.content:write">
                          <button
                            type="button"
                            className="ml-3 text-blue-700 hover:underline"
                            onClick={() => openForm(book)}
                          >
                            ویرایش
                          </button>
                          <button
                            type="button"
                            className="text-red-600 hover:underline disabled:opacity-50"
                            disabled={busyBookId === book.id}
                            onClick={() => void removeBook(book)}
                          >
                            حذف
                          </button>
                        </PermissionGate>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </Section>

        {formOpen ? (
          <Section>
            <form
              dir="rtl"
              onSubmit={saveBook}
              className="space-y-4"
              aria-label="فرم کتاب درسی"
            >
              <h2 className="text-lg font-semibold">
                {editing ? "ویرایش کتاب" : "افزودن کتاب"}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <label className="space-y-1 text-sm">
                  عنوان فارسی
                  <input
                    className={inputClass}
                    required
                    maxLength={200}
                    value={form.title}
                    onChange={(event) => setForm({ ...form, title: event.target.value })}
                  />
                </label>
                <label className="space-y-1 text-sm">
                  کد کتاب
                  <input
                    className={inputClass}
                    required
                    maxLength={80}
                    value={form.code}
                    onChange={(event) => setForm({ ...form, code: event.target.value })}
                  />
                </label>
                <label className="space-y-1 text-sm">
                  مقطع
                  {taxonomyField(
                    "stage",
                    form.stage,
                    (stage) => setForm({ ...form, stage }),
                    true,
                  )}
                </label>
                <label className="space-y-1 text-sm">
                  پایه
                  {taxonomyField(
                    "grade",
                    form.grade,
                    (grade) => setForm({ ...form, grade }),
                    true,
                  )}
                </label>
                <label className="space-y-1 text-sm">
                  رشته
                  {taxonomyField("field", form.field, (field) =>
                    setForm({ ...form, field }),
                  )}
                </label>
                <label className="space-y-1 text-sm">
                  درس
                  {taxonomyField(
                    "subject",
                    form.subject,
                    (subject) => setForm({ ...form, subject }),
                    true,
                  )}
                </label>
                <label className="space-y-1 text-sm">
                  سال تحصیلی
                  <input
                    className={inputClass}
                    required
                    maxLength={24}
                    placeholder="۱۴۰۵-۱۴۰۶"
                    value={form.academicYear}
                    onChange={(event) =>
                      setForm({ ...form, academicYear: event.target.value })
                    }
                  />
                </label>
                <label className="space-y-1 text-sm">
                  نوع منبع
                  <select
                    className={inputClass}
                    value={form.sourceType}
                    onChange={(event) => {
                      const sourceType = event.target.value as CmsTextbookSourceType;
                      setForm({
                        ...form,
                        sourceType,
                        status:
                          sourceType === "UPLOADED" && form.status === "published"
                            ? "draft"
                            : form.status,
                      });
                    }}
                  >
                    {Object.entries(SOURCE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1 text-sm">
                  وضعیت
                  <PermissionGate
                    permission="website.content:publish"
                    fallback={<p className="pt-2">{STATUS_LABELS[form.status]}</p>}
                  >
                    <select
                      className={inputClass}
                      value={form.status}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          status: event.target.value as CmsTextbookStatus,
                        })
                      }
                    >
                      {availableStatuses(form.sourceType, form.status).map((value) => (
                        <option key={value} value={value}>
                          {STATUS_LABELS[value]}
                        </option>
                      ))}
                    </select>
                  </PermissionGate>
                </label>
                {form.sourceType === "EXTERNAL_LINK" ? (
                  <label className="space-y-1 text-sm sm:col-span-2">
                    پیوند بیرونی (HTTPS)
                    <input
                      className={inputClass}
                      type="url"
                      pattern="https://.*"
                      dir="ltr"
                      required
                      value={form.externalUrl}
                      onChange={(event) =>
                        setForm({ ...form, externalUrl: event.target.value })
                      }
                    />
                  </label>
                ) : null}
                <label className="space-y-1 text-sm sm:col-span-2">
                  منبع / پدیدآورنده
                  <input
                    className={inputClass}
                    required
                    maxLength={300}
                    value={form.sourceAttribution}
                    onChange={(event) =>
                      setForm({ ...form, sourceAttribution: event.target.value })
                    }
                  />
                </label>
              </div>
              {actionError ? (
                <p role="alert" className="text-sm text-red-600">
                  {actionError}
                </p>
              ) : null}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50"
                >
                  {isSaving ? "در حال ذخیره…" : "ذخیره"}
                </button>
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="rounded-md border border-slate-300 px-4 py-2 text-sm"
                >
                  لغو
                </button>
              </div>
            </form>
          </Section>
        ) : null}
      </PermissionGate>
    </PageContainer>
  );
}
