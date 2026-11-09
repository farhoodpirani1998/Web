import { EmptyState, Section, Stack, Text } from "@/shared/design-system/components";

interface SuccessStateProps {
  referenceCode: string;
}

/** Confirmation UI for a successfully created pre-registration. */
export function SuccessState({ referenceCode }: SuccessStateProps) {
  return (
    <Section spacing="lg" aria-label="نتیجه پیش‌ثبت‌نام">
      <Stack gap="sm" align="center">
        <EmptyState
          title="پیش‌ثبت‌نام شما با موفقیت ثبت شد"
          description="کد پیگیری درخواست شما:"
        />
        <Text as="span" variant="body" weight="semibold" dir="ltr">
          {referenceCode}
        </Text>
      </Stack>
    </Section>
  );
}
