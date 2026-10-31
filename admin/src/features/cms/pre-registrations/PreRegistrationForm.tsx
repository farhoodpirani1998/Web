/**
 * Pre-Registration detail / triage form using React Hook Form + Zod.
 */
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { z } from "zod";

import { ApiError } from "@/lib/apiError";
import { updatePreRegistrationStatus } from "./api";
import { preRegistrationStatusSchema } from "./schema";
import type { CmsPreRegistration, CmsPreRegistrationStatus } from "./types";

export interface PreRegistrationFormProps {
  preRegistration: CmsPreRegistration | null;
  onCancel: () => void;
  onSaved: (pre: CmsPreRegistration) => void;
}

const formSchema = z.object({
  status: preRegistrationStatusSchema,
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function PreRegistrationForm({ preRegistration, onCancel, onSaved }: PreRegistrationFormProps) {
  const isEdit = preRegistration !== null;
  const [saveError, setSaveError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: preRegistration
      ? { status: preRegistration.status as CmsPreRegistrationStatus, notes: preRegistration.notes ?? "" }
      : { status: "new", notes: "" },
  });

  async function onSubmit(data: FormData) {
    setSaveError(null);
    try {
      if (isEdit && preRegistration) {
        const saved = await updatePreRegistrationStatus(preRegistration.id, data.status);
        onSaved({ ...saved, notes: data.notes } as CmsPreRegistration);
      } else {
        onCancel();
      }
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : "خطا در ذخیره");
    }
  }

  return (
    <form dir="rtl" onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {preRegistration && (
        <div className="rounded-md border bg-gray-50 p-4 text-sm space-y-1">
          <div><strong>نام دانش‌آموز:</strong> {preRegistration.studentFirstName} {preRegistration.studentLastName}</div>
          <div><strong>کد ملی:</strong> {preRegistration.studentNationalId}</div>
          <div><strong>تاریخ تولد:</strong> {preRegistration.studentBirthDate}</div>
          <div><strong>پایه:</strong> {preRegistration.studentGrade}</div>
          <div><strong>وضعیت:</strong> {preRegistration.status}</div>
        </div>
      )}
      <div>
        <label htmlFor="status" className="block text-sm font-medium">وضعیت</label>
        <select id="status" {...register("status")} className="mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
          <option value="new">جدید</option>
          <option value="contacted">تماس گرفته شده</option>
          <option value="archived">آرشیو</option>
        </select>
        {errors.status && <p className="mt-1 text-xs text-red-600">{errors.status.message}</p>}
      </div>
      <div>
        <label htmlFor="notes" className="block text-sm font-medium">یادداشت</label>
        <textarea id="notes" rows={3} {...register("notes")} className="mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
      </div>
      {saveError && <p className="text-sm text-red-600">{saveError}</p>}
      <div className="flex gap-3">
        <button type="submit" disabled={isSubmitting} className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60">ذخیره</button>
        <button type="button" onClick={onCancel} className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50">لغو</button>
      </div>
    </form>
  );
}
