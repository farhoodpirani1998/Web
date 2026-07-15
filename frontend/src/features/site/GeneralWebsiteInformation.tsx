import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Grid,
  Heading,
  Section,
  Stack,
  Text,
} from "@/shared/design-system/components";
import { APP_NAME } from "@/shared/config/app";

import { useSiteSettings } from "./useSiteSettings";

/**
 * Site Settings "General Website Information" section — the
 * miscellaneous site-level fields (name, description, founding year,
 * default locale) a real Site Settings record would carry, following
 * the same pattern as `hero`/`about`/`contact`/`schools`/`news`/
 * `gallery`/`statistics`.
 *
 * Backed by `useSiteSettings()` (Website Frontend Architecture §4, §8).
 * Fields are still grouped into a local array literal so the layout
 * below doesn't need to change, but each field's `value` now reads
 * from the API response, falling back to this section's original
 * frontend-owned placeholder while the query is loading, has errored,
 * or the field (e.g. optional `foundedYear`) is absent.
 */

const SITE_DESCRIPTION_PLACEHOLDER =
  "گروه آموزشی ندای حقیقت با هدف ارتقای کیفیت آموزش و یادگیری، محتوای آموزشی و خدمات مشاوره‌ای را برای دانش‌آموزان و خانواده‌های آن‌ها فراهم می‌کند.";
const SITE_FOUNDED_PLACEHOLDER = "۱۳۷۸";
const SITE_LOCALE_PLACEHOLDER = "فارسی (fa)";
const SITE_STATUS_LABEL: Record<"active" | "maintenance", string> = {
  active: "فعال",
  maintenance: "در حال تعمیر",
};
const SITE_STATUS_PLACEHOLDER = SITE_STATUS_LABEL.active;

export function GeneralWebsiteInformation() {
  const { data } = useSiteSettings();
  const general = data?.general;

  const description = general?.description ?? SITE_DESCRIPTION_PLACEHOLDER;

  const generalFields = [
    { id: "name", label: "نام سایت", value: data?.brand.name ?? APP_NAME },
    { id: "founded", label: "سال تأسیس", value: general?.foundedYear ?? SITE_FOUNDED_PLACEHOLDER },
    {
      id: "locale",
      label: "زبان پیش‌فرض",
      value: general?.defaultLocale ?? SITE_LOCALE_PLACEHOLDER,
    },
    {
      id: "status",
      label: "وضعیت انتشار",
      value: general ? SITE_STATUS_LABEL[general.status] : SITE_STATUS_PLACEHOLDER,
    },
  ] as const;

  return (
    <Section spacing="lg" aria-labelledby="site-general-heading">
      <Stack gap="md">
        <Stack gap="sm">
          <Badge variant="secondary" className="w-fit">
            تنظیمات سایت
          </Badge>
          <Heading id="site-general-heading" level={2}>
            اطلاعات عمومی وب‌سایت
          </Heading>
          <Text variant="lead" className="max-w-2xl">
            {description}
          </Text>
        </Stack>

        <Grid cols="4" gap="md">
          {generalFields.map((field) => (
            <Card key={field.id} variant="outline" padding="md">
              <CardHeader className="p-0">
                <CardTitle>{field.label}</CardTitle>
              </CardHeader>
              <CardContent className="p-0 pt-2">
                <Text variant="bodySm" color="muted">
                  {field.value}
                </Text>
              </CardContent>
            </Card>
          ))}
        </Grid>
      </Stack>
    </Section>
  );
}
