import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Grid,
  Link,
  Section,
  Stack,
  Text,
} from "@/shared/design-system/components";
import { cn } from "@/shared/utils/cn";
import { useSiteSettings } from "@/features/site";
import { getContactPhones, toTelephoneHref } from "@/shared/config/contact";
import { toPersianDigits } from "@/shared/utils/toPersianDigits";

type ContactItem =
  | { id: string; label: string; type: "text"; value: string }
  | { id: string; label: string; type: "link"; value: string; href: string };

/**
 * Contact page "Info" section (address/phone/email cards) — extracted
 * from `ContactPage`'s inline markup without changing layout or
 * styling, following the same pattern as the `hero`/`features`/`cta`/
 * `about` features.
 *
 * Contact items are derived from Site Settings. Missing data is omitted
 * rather than replaced with invented contact details.
 *
 * Visual refresh: now wraps its grid in a `Section` (own vertical
 * spacing, matching every other section on the site) and each card
 * gets a small navy/gold icon medallion keyed off `item.id` (the same
 * "decorative marker built from existing tokens" technique
 * `AboutValues`/`NewsCard` use) plus the `elevated`/hover-lift
 * treatment used across the redesigned pages, so these read as
 * premium contact cards instead of plain bordered boxes. `item.id`
 * already exists in this literal; the icon lookup is purely
 * presentational and adds no new data field.
 */

export function ContactInfo() {
  const { data } = useSiteSettings();
  const workingHours =
    data?.workingHours?.filter(
      ({ isClosed, openTime, closeTime }) => isClosed || (openTime && closeTime),
    ) ?? [];

  const phones = getContactPhones(data?.contactPhones, data?.contactPhone);
  const contactItems: ContactItem[] = [];

  if (data?.address?.fa) {
    contactItems.push(
      data.mapUrl
        ? {
            id: "address",
            label: "آدرس",
            type: "link",
            value: data.address.fa,
            href: data.mapUrl,
          }
        : { id: "address", label: "آدرس", type: "text", value: data.address.fa },
    );
  }
  phones.forEach((phone, index) => {
    contactItems.push({
      id: `phone-${index}`,
      label: "تلفن",
      type: "link",
      value: toPersianDigits(phone),
      href: toTelephoneHref(phone),
    });
  });
  if (data?.contactEmail) {
    contactItems.push({
      id: "email",
      label: "ایمیل",
      type: "link",
      value: data.contactEmail,
      href: `mailto:${data.contactEmail}`,
    });
  }

  if (contactItems.length === 0 && workingHours.length === 0) return null;

  return (
    <Section
      spacing="none"
      aria-labelledby="contact-info-heading"
      className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-8"
    >
      <Stack gap="xl">
        <div>
          <p className="mb-2 text-sm font-medium text-sky-300">راه‌های ارتباط مستقیم</p>
          <h2
            id="contact-info-heading"
            className="font-heading text-2xl font-bold text-white"
          >
            همراهت هستیم
          </h2>
        </div>
        {contactItems.length > 0 ? (
          <Grid cols="1" gap="md">
            {contactItems.map((item) => {
              const Icon = getContactIcon(item.id);
              return (
                <Card
                  key={item.id}
                  variant="outline"
                  padding="md"
                  className="border-white/10 bg-slate-900/40 text-white transition-colors hover:border-sky-200/30"
                >
                  <CardHeader className="flex-row items-center gap-3 p-0">
                    <span
                      aria-hidden="true"
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-300/10 text-sky-200"
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <CardTitle className="font-heading text-white">
                      {item.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 pt-3">
                    {item.type === "link" ? (
                      <Link
                        href={item.href}
                        variant="subtle"
                        dir={
                          item.id.startsWith("phone-") || item.id === "email"
                            ? "ltr"
                            : undefined
                        }
                        className="inline-block break-all text-left text-sky-200"
                      >
                        {item.value}
                      </Link>
                    ) : (
                      <Text variant="bodySm" className="break-words text-slate-300">
                        {item.value}
                      </Text>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </Grid>
        ) : null}
        {workingHours.length > 0 ? (
          <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-5">
            <h3 className="font-heading text-base font-semibold text-white">
              ساعات پاسخ‌گویی
            </h3>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              {workingHours.map(({ day, openTime, closeTime, isClosed }) => (
                <div
                  key={day}
                  className="flex items-center justify-between gap-4 text-sm"
                >
                  <dt className="font-medium text-slate-200">{DAY_LABELS[day]}</dt>
                  <dd className="text-slate-300">
                    {isClosed ? "تعطیل" : `${openTime} تا ${closeTime}`}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ) : null}
      </Stack>
    </Section>
  );
}

const DAY_LABELS = {
  saturday: "شنبه",
  sunday: "یکشنبه",
  monday: "دوشنبه",
  tuesday: "سه‌شنبه",
  wednesday: "چهارشنبه",
  thursday: "پنجشنبه",
  friday: "جمعه",
} as const;

/**
 * Maps a `contactItems` entry's `id` to a decorative icon for its
 * medallion. Purely presentational — an unknown id falls back to a
 * neutral pin glyph rather than throwing.
 */
function getContactIcon(id: string) {
  if (id === "phone" || id.startsWith("phone-")) return PhoneIcon;
  if (id === "email") return MailIcon;
  return PinIcon;
}

function PinIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn(className)}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M12 21s-7-6.1-7-11.5A7 7 0 0 1 19 9.5C19 14.9 12 21 12 21Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="9.5"
        r="2.25"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn(className)}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M6 3.5h3l1.5 4-2 1.5a10 10 0 0 0 6.5 6.5l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4 5.7 2 2 0 0 1 6 3.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn(className)}
      aria-hidden="true"
      focusable="false"
    >
      <rect
        x="3"
        y="5.5"
        width="18"
        height="13"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M4 7l8 6 8-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
