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

/**
 * Site Settings "General Website Information" section — the
 * miscellaneous site-level fields (name, description, founding year,
 * default locale) a real Site Settings record would carry, following
 * the same pattern as `hero`/`about`/`contact`/`schools`/`news`/
 * `gallery`/`statistics`.
 *
 * Presentation only: composed entirely from existing design-system
 * primitives (`Section`, `Stack`, `Grid`, `Card`, `Badge`, `Text`) — no
 * data fetching, no business logic. Fields are grouped into a local
 * array literal, shaped the way a future `useSiteSettings()` data
 * hook's result would look, so the eventual swap is a matter of
 * replacing this literal.
 */

const SITE_DESCRIPTION_PLACEHOLDER =
  "گروه آموزشی ندای حقیقت با هدف ارتقای کیفیت آموزش و یادگیری، محتوای آموزشی و خدمات مشاوره‌ای را برای دانش‌آموزان و خانواده‌های آن‌ها فراهم می‌کند.";

const generalFields = [
  { id: "name", label: "نام سایت", value: APP_NAME },
  { id: "founded", label: "سال تأسیس", value: "۱۳۷۸" },
  { id: "locale", label: "زبان پیش‌فرض", value: "فارسی (fa)" },
  { id: "status", label: "وضعیت انتشار", value: "فعال" },
] as const;

export function GeneralWebsiteInformation() {
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
            {SITE_DESCRIPTION_PLACEHOLDER}
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
