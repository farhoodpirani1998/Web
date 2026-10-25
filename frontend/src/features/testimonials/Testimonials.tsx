import { Quote, Star } from "lucide-react";

import {
  Avatar,
  Badge,
  Card,
  CardContent,
  Grid,
  Heading,
  Section,
  Stack,
  Text,
} from "@/shared/design-system/components";
import { cn } from "@/shared/utils/cn";

import type { TestimonialItem } from "./types";
import { useTestimonials } from "./useTestimonials";

/**
 * Homepage "Testimonials" section — the reviews/quote band.
 *
 * The backend Testimonials module + admin CRUD existed with nothing on
 * the site rendering it; this is that missing consumer. Backed by
 * `useTestimonials()` (`GET /public/testimonials`, §4, §8). The
 * endpoint is feature-flag gated server-side
 * (`featureFlags.testimonialsEnabled` → `[]` when off), so a disabled
 * section simply renders nothing here rather than needing its own flag
 * check.
 *
 * Rendered inside the homepage's `PageLayout` (an ordinary light
 * section), so it sits alongside `HomeNews`/`HomeGallery` rather than
 * opening its own full-bleed band.
 */
export function Testimonials() {
  const { data } = useTestimonials();

  // Nothing published / section disabled — render nothing rather than an
  // empty heading (the endpoint returns [] in both cases).
  if (!data || data.length === 0) return null;

  return (
    <Section spacing="lg" tone="muted" aria-labelledby="testimonials-heading">
      <Stack gap="xl">
        <Stack gap="sm" align="center" className="text-center">
          <Badge
            variant="outline"
            className="w-fit rounded-full border-brand-gold/40 bg-brand-gold/10 text-brand-navy"
          >
            نظرات خانواده‌ها
          </Badge>
          <Heading id="testimonials-heading" level={2}>
            از زبان خانواده‌ها و دانش‌آموزان
          </Heading>
          <span aria-hidden="true" className="block h-1 w-16 rounded-full bg-brand-gold" />
          <Text variant="lead" className="max-w-2xl">
            تجربه‌ی خانواده‌ها و دانش‌آموزان از همراهی با مجموعه‌ی ما.
          </Text>
        </Stack>

        <Grid cols="3" gap="lg">
          {data.map((item) => (
            <TestimonialCard key={item.id} item={item} />
          ))}
        </Grid>
      </Stack>
    </Section>
  );
}

function TestimonialCard({ item }: { item: TestimonialItem }) {
  const role = item.authorRole?.fa;

  return (
    <Card variant="elevated" padding="lg" className="flex h-full flex-col bg-background">
      <Quote
        aria-hidden="true"
        className="h-7 w-7 shrink-0 text-brand-gold/50"
        strokeWidth={1.75}
      />

      <CardContent className="flex flex-1 flex-col gap-4 p-0 pt-4">
        <Text variant="body" color="muted" className="flex-1 leading-relaxed">
          {item.content.fa}
        </Text>

        {typeof item.rating === "number" ? <Rating value={item.rating} /> : null}

        <div className="flex items-center gap-3 border-t border-border pt-4">
          <Avatar
            size="default"
            src={item.avatar?.cardUrl ?? item.avatar?.url}
            alt={item.avatar?.altText ?? item.authorName}
            fallback={item.authorName.slice(0, 1)}
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-brand-navy">{item.authorName}</p>
            {role ? <p className="truncate text-xs text-muted-foreground">{role}</p> : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/** Static 1–5 star row (aria-labelled, decorative icons). */
function Rating({ value }: { value: number }) {
  const filled = Math.max(0, Math.min(5, Math.round(value)));

  return (
    <div
      role="img"
      aria-label={`امتیاز ${filled} از ۵`}
      className="flex items-center gap-0.5"
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          aria-hidden="true"
          className={cn(
            "h-4 w-4",
            index < filled ? "fill-brand-gold text-brand-gold" : "text-border",
          )}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}
