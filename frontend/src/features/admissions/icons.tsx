import { cn } from "@/shared/utils/cn";

/**
 * Decorative, `aria-hidden` icon set local to the `admissions` feature
 * — the same technique already used by `@/features/hero`'s
 * `SparkIcon`/`HeroEmblem` and `@/features/contact`'s
 * `PinIcon`/`PhoneIcon`/`MailIcon`: small inline SVGs built only from
 * existing tokens (`currentColor`, `brand-gold`), not a new shared
 * design-system primitive. Kept in one file because this feature needs
 * the same handful of icons across several sections (`Hero`,
 * `AdmissionSteps`, `Requirements`, `RequiredDocuments`,
 * `TuitionOverview`); every consumer stays inside this feature folder.
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

export function MapPinIcon({ className }: IconProps) {
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

export function ChatIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn(className)} aria-hidden="true" focusable="false">
      <path
        d="M4 5.5h16v11H9l-4 3.5v-3.5H4v-11Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M8 10h8M8 13h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function DocumentIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn(className)} aria-hidden="true" focusable="false">
      <path
        d="M6.5 3.5h8l4 4v13a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1v-16a1 1 0 0 1 1-1Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M14 3.5v4h4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M8.5 13h7M8.5 16.5h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function IdCardIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn(className)} aria-hidden="true" focusable="false">
      <rect x="3" y="5.5" width="18" height="13" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="8.5" cy="11" r="1.75" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5.8 15.3c.5-1.2 1.5-1.9 2.7-1.9s2.2.7 2.7 1.9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M14.5 10h4M14.5 13h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function CameraIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn(className)} aria-hidden="true" focusable="false">
      <path
        d="M4 8.5a1 1 0 0 1 1-1h2l1.2-2h7.6l1.2 2h2a1 1 0 0 1 1 1v9.5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="13" r="3.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function SwapIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn(className)} aria-hidden="true" focusable="false">
      <path
        d="M4 8h13M17 8l-3-3M17 8l-3 3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 16H7M7 16l3-3M7 16l3 3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function HeartIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn(className)} aria-hidden="true" focusable="false">
      <path
        d="M12 20s-7.5-4.6-9.3-9.5C1.6 7.3 3.4 4.5 6.4 4.2c1.8-.2 3.4.7 4.6 2.2 1.2-1.5 2.8-2.4 4.6-2.2 3 .3 4.8 3.1 3.7 6.3C19.5 15.4 12 20 12 20Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M9 11.5h2l1.2-2 1.6 3.5 1-1.5h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
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
