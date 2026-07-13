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
 */

const fieldClassName =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm " +
  "text-foreground placeholder:text-muted-foreground transition-colors " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

const textareaClassName = cn(fieldClassName, "h-auto min-h-24 py-2 resize-none");

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
          <Text variant="lead" className="max-w-2xl">
            متن نمونه برای راهنمای تکمیل فرم. فیلدهای ستاره‌دار تکمیل آن‌ها الزامی است.
          </Text>
        </Stack>

        <Card variant="outline" padding="lg" className="mx-auto w-full max-w-3xl">
          <form noValidate aria-label="فرم پیش‌ثبت‌نام دانش‌آموز">
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
                    />
                  </div>
                  <div className="min-w-[240px] flex-1">
                    <Field
                      id="student-last-name"
                      label="نام خانوادگی"
                      required
                      autoComplete="family-name"
                    />
                  </div>
                </Stack>
                <Stack direction="row" gap="md" wrap>
                  <div className="min-w-[240px] flex-1">
                    <Field id="student-national-id" label="کد ملی" required />
                  </div>
                  <div className="min-w-[240px] flex-1">
                    <Field
                      id="student-birth-date"
                      label="تاریخ تولد"
                      type="date"
                      required
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
                    className={fieldClassName}
                  >
                    <option value="">انتخاب کنید</option>
                    <option value="grade-1">پایه اول ابتدایی</option>
                    <option value="grade-2">پایه دوم ابتدایی</option>
                    <option value="grade-3">پایه سوم ابتدایی</option>
                    <option value="grade-7">پایه هفتم</option>
                    <option value="grade-10">پایه دهم</option>
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
                    />
                  </div>
                  <div className="min-w-[240px] flex-1">
                    <Field
                      id="guardian-phone"
                      label="شماره تماس"
                      type="tel"
                      required
                      autoComplete="tel"
                    />
                  </div>
                </Stack>
                <Field
                  id="guardian-email"
                  label="ایمیل (اختیاری)"
                  type="email"
                  autoComplete="email"
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
                    className={textareaClassName}
                  />
                </Stack>
              </Stack>

              <Text variant="caption" color="muted">
                این فرم در حال حاضر صرفاً جنبه نمایشی دارد و ثبت اطلاعات پس از فعال‌سازی
                سرویس مربوطه امکان‌پذیر خواهد بود.
              </Text>

              <Stack direction="row" gap="sm" className="justify-end" wrap>
                <Button type="button" variant="outline">
                  انصراف
                </Button>
                <Button type="button" variant="default">
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
