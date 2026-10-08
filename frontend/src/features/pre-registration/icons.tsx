import { cn } from "@/shared/utils/cn";

/**
 * Decorative, `aria-hidden` icon set local to the `pre-registration`
 * feature — the same technique already used by `@/features/hero`'s
 * `SparkIcon`/`HeroEmblem` and `@/features/contact`'s
 * `PinIcon`/`PhoneIcon`/`MailIcon`: small inline SVGs built only from
 * existing tokens (`currentColor`, `brand-gold`), not a new shared
 * design-system primitive. Kept in one file because this feature (unlike
 * `contact`) needs the same handful of icons across several sections
 * (`Hero`, `Information`, `RegistrationForm`); every consumer stays
 * inside this feature folder.
 */

interface IconProps {
  className?: string;
}

export function SparkIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true" focusable="false">
      <path
        d="M8 0.5 9.4 6.1 15 8 9.4 9.9 8 15.5 6.6 9.9 1 8 6.6 6.1 8 0.5Z"
        className="fill-brand-gold"
      />
    </svg>
  );
}

export function CalendarIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn(className)} aria-hidden="true" focusable="false">
      <rect x="3.5" y="5" width="17" height="15" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3.5 9.5h17" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function BookIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn(className)} aria-hidden="true" focusable="false">
      <path
        d="M4 5.5A2 2 0 0 1 6 4h6v16H6a2 2 0 0 0-2 2v-16.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M20 5.5A2 2 0 0 0 18 4h-6v16h6a2 2 0 0 1 2 2v-16.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function UsersIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn(className)} aria-hidden="true" focusable="false">
      <circle cx="9" cy="8" r="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M3.5 19.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M15.5 5.3a3 3 0 0 1 0 5.9M17.5 19.5c0-2.6-1.9-4.5-4.2-4.9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn(className)} aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="m8 12.5 2.5 2.5 5.5-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ChevronDownIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn(className)} aria-hidden="true" focusable="false">
      <path
        d="m6 9 6 6 6-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
