import {
  BookOpen,
  Dumbbell,
  FlaskConical,
  Globe,
  Monitor,
  Music,
  type LucideIcon,
} from "lucide-react";

// Keep this allowlist aligned with ICON_MAP in frontend/src/features/features/Features.tsx.
export const FEATURE_ICON_OPTIONS: ReadonlyArray<{
  key: string;
  label: string;
  icon: LucideIcon;
}> = [
  { key: "Monitor", label: "کلاس هوشمند", icon: Monitor },
  { key: "FlaskConical", label: "آزمایشگاه", icon: FlaskConical },
  { key: "BookOpen", label: "کتابخانه", icon: BookOpen },
  { key: "Dumbbell", label: "امکانات ورزشی", icon: Dumbbell },
  { key: "Globe", label: "آموزش زبان", icon: Globe },
  { key: "Music", label: "فعالیت فرهنگی", icon: Music },
];

export const FEATURE_ICON_KEYS = [
  "Monitor",
  "FlaskConical",
  "BookOpen",
  "Dumbbell",
  "Globe",
  "Music",
] as const;
