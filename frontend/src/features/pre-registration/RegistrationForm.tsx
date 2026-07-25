import * as React from "react";

import {
  Button,
  Card,
  Heading,
  Section,
  Stack,
  Text,
  Typography,
} from "@/shared/design-system/components";
import { cn } from "@/shared/utils/cn";
import { ApiError } from "@/shared/api";

import { submitPreRegistration } from "./api";
import { SuccessState } from "./SuccessState";
import type { PreRegistrationPayload } from "./types";

/**
 * Pre-registration page "Registration Form" section.
 *
 * Wired to the real backend (`POST /public/pre-registration`, via
 * `submitPreRegistration` — see `./api.ts`): every field below is now a
 * *controlled* element (`value`/`onChange` against `formValues`), the
 * submit control is a real `type="submit"` inside an `onSubmit`-handled
 * `<form>`, and a successful submission swaps this component's output
 * for `SuccessState` (see the bottom of this file) rather than staying
 * on the form. Same `handleSubmit`/`isSubmitting`/`error` shape as the
 * admin app's `LoginPage` — the closest existing example of a real
 * submit flow in this codebase.
 *
 * Field set, labels, and visual layout are unchanged from the original
 * presentation-only version — this sprint only adds state/handlers, no
 * redesign. No "campus of interest" field: the form only ever collected
 * a grade, so none was invented on the backend either.
 *
 * No shared `Input`/`Textarea`/`Select`/`Label` primitives exist yet in
 * the design system (`@/shared/design-system/components`), so this
 * section still styles native form elements locally with the same
 * tokens (`border-input`, `bg-background`, `ring-ring`, §12/§13) `Button`
 * already uses, same as before.
 */

const fieldClassName =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm " +
  "text-foreground placeholder:text-muted-foreground transition-colors " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 " +
  "disabled:cursor-not-allowed disabled:opacity-60";

const textareaClassName = cn(fieldClassName, "h-auto min-h-24 py-2 resize-none");

const labelClassName = "text-sm font-medium text-foreground";

const GRADE_OPTIONS = [
  { value: "grade-1", label: "پایه اول ابتدایی" },
  { value: "grade-2", label: "پایه دوم ابتدایی" },
  { value: "grade-3", label: "پایه سوم ابتدایی" },
  { value: "grade-7", label: "پایه هفتم" },
  { value: "grade-10", label: "پایه دهم" },
] as const;

/** Every field starts empty — matches `CreatePreRegistrationDto`'s required/optional shape. */
const EMPTY_FORM_VALUES: PreRegistrationPayload = {
  studentFirstName: "",
  studentLastName: "",
  studentNationalId: "",
  studentBirthDate: "",
  studentGrade: "",
  guardianFullName: "",
  guardianPhone: "",
  guardianEmail: "",
  notes: "",
};

interface FieldProps {
  id: string;
  label: string;
  type?: React.HTMLInputTypeAttribute;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

function Field({
  id,
  label,
  type = "text",
  placeholder,
  required,
  autoComplete,
  value,
  onChange,
  disabled,
}: FieldProps) {
  return (
    <Stack gap="xs">
      <label htmlFor={id} className={labelClassName}>
        {label}
        {required && (
          <Text as="span" variant="bodySm" color="destructive" className="ms-1">
            *
          </Text>
        )}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className={fieldClassName}
      />
    </Stack>
  );
}

export function RegistrationForm() {
  const [formValues, setFormValues] = React.useState<PreRegistrationPayload>(EMPTY_FORM_VALUES);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function updateField<K extends keyof PreRegistrationPayload>(
    field: K,
    value: PreRegistrationPayload[K],
  ) {
    setFormValues((current) => ({ ...current, [field]: value }));
  }

  function handleCancel() {
    setFormValues(EMPTY_FORM_VALUES);
    setError(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Optional fields: send `undefined` rather than an empty string
      // when unfilled, matching `CreatePreRegistrationDto`'s `@IsOptional`
      // fields (an empty string would otherwise fail `@IsEmail`).
      await submitPreRegistration({
        ...formValues,
        guardianEmail: formValues.guardianEmail || undefined,
        notes: formValues.notes || undefined,
      });
      setIsSuccess(true);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "خطایی رخ داد. لطفاً دوباره تلاش کنید.",
      );
      setIsSubmitting(false);
    }
    // No `finally` for isSubmitting=false on the success path: once
    // `isSuccess` is set, this component renders `SuccessState` instead
    // of the form, same reasoning as the admin `LoginPage`'s own
    // comment on why it leaves the button in its submitting state.
  }

  if (isSuccess) {
    return <SuccessState />;
  }

  return (
    <Section
      spacing="lg"
      id="registration-form"
      aria-labelledby="pre-registration-form-heading"
    >
      <Stack gap="lg">
        <Stack gap="sm" align="center" className="text-center">
          <Heading id="pre-registration-form-heading" level={2}>
            فرم پیش‌ثبت‌نام
          </Heading>
          <Text variant="lead" className="max-w-2xl">
            متن نمونه برای راهنمای تکمیل فرم. فیلدهای ستاره‌دار تکمیل آن‌ها الزامی است.
          </Text>
        </Stack>

        <Card variant="outline" padding="lg" className="mx-auto w-full max-w-3xl">
          <form
            noValidate
            aria-label="فرم پیش‌ثبت‌نام دانش‌آموز"
            onSubmit={handleSubmit}
          >
            <Stack gap="lg">
              <Stack as="fieldset" gap="md" className="m-0 border-0 p-0">
                <Typography as="legend" variant="overline" className="px-0">
                  اطلاعات دانش‌آموز
                </Typography>
                <Stack direction="row" gap="md" wrap>
                  <div className="min-w-[240px] flex-1">
                    <Field
                      id="student-first-name"
                      label="نام"
                      required
                      autoComplete="given-name"
                      value={formValues.studentFirstName}
                      onChange={(value) => updateField("studentFirstName", value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="min-w-[240px] flex-1">
                    <Field
                      id="student-last-name"
                      label="نام خانوادگی"
                      required
                      autoComplete="family-name"
                      value={formValues.studentLastName}
                      onChange={(value) => updateField("studentLastName", value)}
                      disabled={isSubmitting}
                    />
                  </div>
                </Stack>
                <Stack direction="row" gap="md" wrap>
                  <div className="min-w-[240px] flex-1">
                    <Field
                      id="student-national-id"
                      label="کد ملی"
                      required
                      value={formValues.studentNationalId}
                      onChange={(value) => updateField("studentNationalId", value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="min-w-[240px] flex-1">
                    <Field
                      id="student-birth-date"
                      label="تاریخ تولد"
                      type="date"
                      required
                      value={formValues.studentBirthDate}
                      onChange={(value) => updateField("studentBirthDate", value)}
                      disabled={isSubmitting}
                    />
                  </div>
                </Stack>

                <Stack gap="xs">
                  <label htmlFor="student-grade" className={labelClassName}>
                    پایه تحصیلی مورد نظر
                    <Text as="span" variant="bodySm" color="destructive" className="ms-1">
                      *
                    </Text>
                  </label>
                  <select
                    id="student-grade"
                    name="student-grade"
                    required
                    value={formValues.studentGrade}
                    onChange={(event) => updateField("studentGrade", event.target.value)}
                    disabled={isSubmitting}
                    className={fieldClassName}
                  >
                    <option value="">انتخاب کنید</option>
                    {GRADE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </Stack>
              </Stack>

              <Stack as="fieldset" gap="md" className="m-0 border-0 p-0">
                <Typography as="legend" variant="overline" className="px-0">
                  اطلاعات والدین
                </Typography>
                <Stack direction="row" gap="md" wrap>
                  <div className="min-w-[240px] flex-1">
                    <Field
                      id="guardian-full-name"
                      label="نام و نام خانوادگی والد"
                      required
                      value={formValues.guardianFullName}
                      onChange={(value) => updateField("guardianFullName", value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="min-w-[240px] flex-1">
                    <Field
                      id="guardian-phone"
                      label="شماره تماس"
                      type="tel"
                      required
                      autoComplete="tel"
                      value={formValues.guardianPhone}
                      onChange={(value) => updateField("guardianPhone", value)}
                      disabled={isSubmitting}
                    />
                  </div>
                </Stack>
                <Field
                  id="guardian-email"
                  label="ایمیل (اختیاری)"
                  type="email"
                  autoComplete="email"
                  value={formValues.guardianEmail ?? ""}
                  onChange={(value) => updateField("guardianEmail", value)}
                  disabled={isSubmitting}
                />
              </Stack>

              <Stack as="fieldset" gap="md" className="m-0 border-0 p-0">
                <Typography as="legend" variant="overline" className="px-0">
                  توضیحات تکمیلی
                </Typography>
                <Stack gap="xs">
                  <label htmlFor="additional-notes" className={labelClassName}>
                    توضیحات (اختیاری)
                  </label>
                  <textarea
                    id="additional-notes"
                    name="additional-notes"
                    rows={4}
                    placeholder="در صورت نیاز، توضیحات تکمیلی خود را بنویسید."
                    value={formValues.notes ?? ""}
                    onChange={(event) => updateField("notes", event.target.value)}
                    disabled={isSubmitting}
                    className={textareaClassName}
                  />
                </Stack>
              </Stack>

              {error ? (
                <Text role="alert" variant="bodySm" color="destructive">
                  {error}
                </Text>
              ) : null}

              <Stack direction="row" gap="sm" className="justify-end" wrap>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  انصراف
                </Button>
                <Button type="submit" variant="default" disabled={isSubmitting}>
                  {isSubmitting ? "در حال ارسال…" : "ثبت پیش‌ثبت‌نام"}
                </Button>
              </Stack>
            </Stack>
          </form>
        </Card>
      </Stack>
    </Section>
  );
}
