import * as React from "react";

import {
  Button,
  Card,
  Heading,
  Section,
  Separator,
  Stack,
  Text,
  Typography,
} from "@/shared/design-system/components";
import { cn } from "@/shared/utils/cn";
import { ChevronDownIcon } from "./icons";

/**
 * Pre-registration page "Registration Form" section.
 *
 * Presentation only, per this Sprint's explicit scope: no API call, no
 * CMS wiring, no submission handler, and no client-side form state
 * (every field below is an *uncontrolled* native element — no `value`/
 * `onChange` — so there is nothing to lift into `useState` and no
 * React warnings from a half-controlled input). The submit control is
 * `type="button"` rather than `type="submit"` specifically so this
 * static markup can never trigger a native form submission (a full
 * page GET reload) before real submission logic exists; wiring it up
 * is a future, additive change to this file alone.
 *
 * No shared `Input`/`Textarea`/`Select`/`Label` primitives exist yet in
 * the design system (`@/shared/design-system/components`), so this
 * section styles native form elements locally with the same tokens
 * (`border-input`, `bg-background`, `ring-ring`, §12/§13) `Button`
 * already uses, rather than inventing new shared abstractions outside
 * this Sprint's scope. Promoting these to shared primitives is a
 * natural follow-up once a second form exists in the app.
 *
 * Field groups (student info, guardian info, contact info) mirror the
 * "required documents" a real submission would ultimately validate
 * against (§ Information section above) — labels are frontend-owned UI
 * copy; a CMS-driven field configuration is a documented future data
 * source, not implemented here.
 *
 * Visual refresh: the card moves to the `elevated` variant with a thin
 * gold top accent (the same treatment `AboutStats`/`AboutValues` use)
 * and rounds up to `rounded-2xl` so it reads as the page's centerpiece.
 * Each fieldset now opens with a numbered navy/gold marker — the same
 * "numbered step" language `AdmissionSteps`/`AboutValues` already use
 * elsewhere on the site — with a `Separator` between groups instead of
 * relying on gap alone. Paired fields move from a flex-wrap/min-width
 * trick to a proper `sm:grid-cols-2` grid for cleaner alignment, the
 * `<select>` gets a custom gold chevron overlay (native selects don't
 * expose the current focus-ring/appearance styling), and the closing
 * actions sit below a `Separator` with the primary action styled as
 * the same gold call-to-action button used across the site's other
 * primary actions (`Hero`, `CTA`). None of this changes the form's
 * behavior: it is still fully uncontrolled, native, and non-submitting.
 */

const fieldClassName =
  "flex h-11 w-full rounded-md border border-input bg-background px-3.5 py-2 text-sm " +
  "text-foreground placeholder:text-muted-foreground shadow-sm transition-colors " +
  "hover:border-brand-navy/30 focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-ring focus-visible:ring-offset-2";

const textareaClassName = cn(fieldClassName, "h-auto min-h-28 py-2.5 resize-none");

const selectClassName = cn(fieldClassName, "appearance-none pe-9");

const labelClassName = "text-sm font-medium text-foreground";

interface FieldProps {
  id: string;
  label: string;
  type?: React.HTMLInputTypeAttribute;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
}

function Field({
  id,
  label,
  type = "text",
  placeholder,
  required,
  autoComplete,
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
        className={fieldClassName}
      />
    </Stack>
  );
}

interface FieldsetProps {
  index: number;
  title: string;
  children: React.ReactNode;
}

function Fieldset({ index, title, children }: FieldsetProps) {
  return (
    <Stack as="fieldset" gap="md" className="m-0 border-0 p-0">
      <Stack as="legend" direction="row" gap="sm" align="center" className="px-0">
        <span
          aria-hidden="true"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-navy text-xs font-bold text-brand-gold"
        >
          {index}
        </span>
        <Typography as="span" variant="overline" className="text-foreground">
          {title}
        </Typography>
      </Stack>
      {children}
    </Stack>
  );
}

export function RegistrationForm() {
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
          <span aria-hidden="true" className="block h-1 w-16 rounded-full bg-brand-gold" />
          <Text variant="lead" className="max-w-2xl">
            متن نمونه برای راهنمای تکمیل فرم. فیلدهای ستاره‌دار تکمیل آن‌ها الزامی است.
          </Text>
        </Stack>

        <Card
          variant="elevated"
          padding="lg"
          className="relative mx-auto w-full max-w-3xl overflow-hidden rounded-2xl"
        >
          <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 bg-brand-gold" />

          <form noValidate aria-label="فرم پیش‌ثبت‌نام دانش‌آموز" className="pt-1.5">
            <Stack gap="lg">
              <Fieldset index={1} title="اطلاعات دانش‌آموز">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    id="student-first-name"
                    label="نام"
                    required
                    autoComplete="given-name"
                  />
                  <Field
                    id="student-last-name"
                    label="نام خانوادگی"
                    required
                    autoComplete="family-name"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field id="student-national-id" label="کد ملی" required />
                  <Field
                    id="student-birth-date"
                    label="تاریخ تولد"
                    type="date"
                    required
                  />
                </div>

                <Stack gap="xs">
                  <label htmlFor="student-grade" className={labelClassName}>
                    پایه تحصیلی مورد نظر
                    <Text as="span" variant="bodySm" color="destructive" className="ms-1">
                      *
                    </Text>
                  </label>
                  <div className="relative">
                    <select
                      id="student-grade"
                      name="student-grade"
                      required
                      className={selectClassName}
                    >
                      <option value="">انتخاب کنید</option>
                      <option value="grade-1">پایه اول ابتدایی</option>
                      <option value="grade-2">پایه دوم ابتدایی</option>
                      <option value="grade-3">پایه سوم ابتدایی</option>
                      <option value="grade-7">پایه هفتم</option>
                      <option value="grade-10">پایه دهم</option>
                    </select>
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-y-0 end-3 flex items-center text-muted-foreground"
                    >
                      <ChevronDownIcon className="h-4 w-4" />
                    </span>
                  </div>
                </Stack>
              </Fieldset>

              <Separator />

              <Fieldset index={2} title="اطلاعات والدین">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    id="guardian-full-name"
                    label="نام و نام خانوادگی والد"
                    required
                  />
                  <Field
                    id="guardian-phone"
                    label="شماره تماس"
                    type="tel"
                    required
                    autoComplete="tel"
                  />
                </div>
                <Field
                  id="guardian-email"
                  label="ایمیل (اختیاری)"
                  type="email"
                  autoComplete="email"
                />
              </Fieldset>

              <Separator />

              <Fieldset index={3} title="توضیحات تکمیلی">
                <Stack gap="xs">
                  <label htmlFor="additional-notes" className={labelClassName}>
                    توضیحات (اختیاری)
                  </label>
                  <textarea
                    id="additional-notes"
                    name="additional-notes"
                    rows={4}
                    placeholder="در صورت نیاز، توضیحات تکمیلی خود را بنویسید."
                    className={textareaClassName}
                  />
                </Stack>
              </Fieldset>

              <Text variant="caption" color="muted">
                این فرم در حال حاضر صرفاً جنبه نمایشی دارد و ثبت اطلاعات پس از فعال‌سازی
                سرویس مربوطه امکان‌پذیر خواهد بود.
              </Text>

              <Separator />

              <Stack direction="row" gap="sm" className="justify-end" wrap>
                <Button type="button" variant="outline">
                  انصراف
                </Button>
                <Button
                  type="button"
                  variant="default"
                  className="bg-brand-gold text-brand-navy shadow-sm hover:bg-brand-gold/90"
                >
                  ثبت پیش‌ثبت‌نام
                </Button>
              </Stack>
            </Stack>
          </form>
        </Card>
      </Stack>
    </Section>
  );
}
