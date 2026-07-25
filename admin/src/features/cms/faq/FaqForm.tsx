import { useId, useState, type FormEvent } from "react";

import { UnsavedChangesDialog } from "@/components/ui/UnsavedChangesDialog";
import { useIsDirty, useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import { ApiError } from "@/lib/apiError";

import { createFaq, updateFaq } from "./api";
import type { CmsFaq } from "./types";

/**
 * Create/edit dialog for `POST /admin/faqs` and `PATCH /admin/faqs/:id`.
 * Same plain fixed-overlay modal shape as
 * `features/cms/media/MediaUploadDialog.tsx` (see that file's comment
 * on why there's no shared `Dialog` primitive yet).
 *
 * `question.fa`/`answer.fa` are the only required fields, matching
 * `TranslatableTextDto` (`fa` mandatory, `en` optional) — `Locale.FA` is
 * `DEFAULT_LOCALE` server-side. The `en` fields are sent only when
 * non-empty so an update can still clear a previously-set `en` value:
 * `FaqService.update` replaces the whole `question`/`answer` object
 * rather than merging keys, so omitting `en` here correctly drops it.
 *
 * `category` is a flat (non-translatable) field, always sent as typed
 * — including empty, so clearing it in edit mode actually clears it,
 * rather than being silently dropped like the `en` fields above.
 */
export interface FaqFormProps {
  /** `null` for create mode; an existing FAQ for edit mode. */
  faq: CmsFaq | null;
  onCancel: () => void;
  onSaved: (faq: CmsFaq) => void;
}

export function FaqForm({ faq, onCancel, onSaved }: FaqFormProps) {
  const isEdit = faq !== null;

  const questionFaId = useId();
  const questionEnId = useId();
  const answerFaId = useId();
  const answerEnId = useId();
  const categoryId = useId();

  const [questionFa, setQuestionFa] = useState(faq?.question.fa ?? "");
  const [questionEn, setQuestionEn] = useState(faq?.question.en ?? "");
  const [answerFa, setAnswerFa] = useState(faq?.answer.fa ?? "");
  const [answerEn, setAnswerEn] = useState(faq?.answer.en ?? "");
  const [category, setCategory] = useState(faq?.category ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isDirty } = useIsDirty({ questionFa, questionEn, answerFa, answerEn, category });
  const { isConfirmOpen, guardedAction, confirmLeave, cancelLeave } =
    useUnsavedChangesGuard(isDirty);

  const canSubmit = questionFa.trim().length > 0 && answerFa.trim().length > 0 && !isSaving;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setError(null);
    setIsSaving(true);

    const trimmedQuestionEn = questionEn.trim();
    const trimmedAnswerEn = answerEn.trim();

    const payload = {
      question: {
        fa: questionFa.trim(),
        ...(trimmedQuestionEn ? { en: trimmedQuestionEn } : {}),
      },
      answer: {
        fa: answerFa.trim(),
        ...(trimmedAnswerEn ? { en: trimmedAnswerEn } : {}),
      },
      category: category.trim(),
    };

    try {
      const saved = isEdit ? await updateFaq(faq.id, payload) : await createFaq(payload);
      onSaved(saved);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setIsSaving(false);
    }
    // No `finally` resetting isSaving on success: the dialog is about
    // to be unmounted by the parent (`onSaved` closes it), same
    // reasoning as `MediaUploadDialog`'s submit handler.
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          {isEdit ? "Edit FAQ" : "New FAQ"}
        </h2>

        <form className="mt-4 flex max-h-[70vh] flex-col gap-4 overflow-y-auto" onSubmit={handleSubmit} noValidate>
          <div className="flex flex-col gap-1.5">
            <label htmlFor={questionFaId} className="text-sm font-medium text-slate-900">
              Question (Farsi)
            </label>
            <input
              id={questionFaId}
              type="text"
              dir="rtl"
              required
              value={questionFa}
              onChange={(event) => setQuestionFa(event.target.value)}
              disabled={isSaving}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor={questionEnId} className="text-sm font-medium text-slate-900">
              Question (English) <span className="font-normal text-slate-400">— optional</span>
            </label>
            <input
              id={questionEnId}
              type="text"
              value={questionEn}
              onChange={(event) => setQuestionEn(event.target.value)}
              disabled={isSaving}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor={answerFaId} className="text-sm font-medium text-slate-900">
              Answer (Farsi)
            </label>
            <textarea
              id={answerFaId}
              dir="rtl"
              rows={4}
              required
              value={answerFa}
              onChange={(event) => setAnswerFa(event.target.value)}
              disabled={isSaving}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor={answerEnId} className="text-sm font-medium text-slate-900">
              Answer (English) <span className="font-normal text-slate-400">— optional</span>
            </label>
            <textarea
              id={answerEnId}
              rows={4}
              value={answerEn}
              onChange={(event) => setAnswerEn(event.target.value)}
              disabled={isSaving}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor={categoryId} className="text-sm font-medium text-slate-900">
              Category <span className="font-normal text-slate-400">— optional</span>
            </label>
            <input
              id={categoryId}
              type="text"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              disabled={isSaving}
              placeholder="e.g. admissions, fees"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
            />
          </div>

          {error ? (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          ) : null}

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => guardedAction(onCancel)}
              disabled={isSaving}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isSaving ? "Saving…" : isEdit ? "Save changes" : "Create FAQ"}
            </button>
          </div>
        </form>
      </div>

      {isConfirmOpen ? (
        <UnsavedChangesDialog onDiscard={confirmLeave} onKeepEditing={cancelLeave} />
      ) : null}
    </div>
  );
}
