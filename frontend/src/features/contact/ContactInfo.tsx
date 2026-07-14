import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Grid,
  Link,
  Section,
  Text,
} from "@/shared/design-system/components";
import { cn } from "@/shared/utils/cn";

/**
 * Contact page "Info" section (address/phone/email cards) — extracted
 * from `ContactPage`'s inline markup without changing layout or
 * styling, following the same pattern as the `hero`/`features`/`cta`/
 * `about` features.
 *
 * Presentation only: composed entirely from existing design-system
 * primitives (`Section`, `Grid`, `Card`, `Link`, `Text`) — no data
 * fetching, no business logic. Contact items are grouped into a local
 * array literal rather than interleaved in JSX (Website Frontend
 * Architecture §4, §8), so the eventual swap to a `useSiteSettings()`-
 * style data hook is a matter of replacing this literal — the layout
 * and design-system wiring below do not need to change. Real
 * address/phone/email are ultimately Site Settings–derived content
 * (the same category of data the app-shell's `Footer` consumes); this
 * renders frontend-owned Persian placeholder copy in the meantime.
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

const contactItems = [
  {
    id: "address",
    label: "آدرس",
    type: "text",
    value: "آدرس نمونه، خیابان نمونه، شهر نمونه.",
  },
  {
    id: "phone",
    label: "تلفن",
    type: "link",
    value: "+0 (000) 000-0000",
    href: "tel:+0000000000",
  },
  {
    id: "email",
    label: "ایمیل",
    type: "link",
    value: "info@example.com",
    href: "mailto:info@example.com",
  },
] as const;

export function ContactInfo() {
  return (
    <Section spacing="lg" aria-labelledby="contact-info-heading">
      <h2 id="contact-info-heading" className="sr-only">
        اطلاعات تماس
      </h2>
      <Grid cols="3" gap="lg">
        {contactItems.map((item) => {
          const Icon = getContactIcon(item.id);
          return (
            <Card
              key={item.id}
              variant="elevated"
              padding="lg"
              className="group bg-background transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <CardHeader className="flex-row items-center gap-3 p-0">
                <span
                  aria-hidden="true"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-navy text-brand-gold"
                >
                  <Icon className="h-5 w-5" />
                </span>
                <CardTitle className="font-heading">{item.label}</CardTitle>
              </CardHeader>
              <CardContent className="p-0 pt-3">
                {item.type === "link" ? (
                  <Link href={item.href} variant="subtle" className="text-brand-navy">
                    {item.value}
                  </Link>
                ) : (
                  <Text variant="bodySm" color="muted">
                    {item.value}
                  </Text>
                )}
              </CardContent>
            </Card>
          );
        })}
      </Grid>
    </Section>
  );
}

/**
 * Maps a `contactItems` entry's `id` to a decorative icon for its
 * medallion. Purely presentational — an unknown id falls back to a
 * neutral pin glyph rather than throwing.
 */
function getContactIcon(id: string) {
  if (id === "phone") return PhoneIcon;
  if (id === "email") return MailIcon;
  return PinIcon;
}

function PinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn(className)} aria-hidden="true" focusable="false">
      <path
        d="M12 21s-7-6.1-7-11.5A7 7 0 0 1 19 9.5C19 14.9 12 21 12 21Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="9.5" r="2.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn(className)} aria-hidden="true" focusable="false">
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
    <svg viewBox="0 0 24 24" className={cn(className)} aria-hidden="true" focusable="false">
      <rect x="3" y="5.5" width="18" height="13" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
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
