import * as React from "react";
import { createPortal } from "react-dom";
import { Building2, GraduationCap, ShieldCheck, Users, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Heading, Text, VisuallyHidden } from "@/shared/design-system/components";
import { Link } from "@/shared/design-system/components/ui/link";
import { FOCUS_RING_CLASSNAME } from "@/shared/design-system/a11y";
import { cn } from "@/shared/utils/cn";

export interface PortalModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Global portal-selector modal (Figma Design Reference §4.3
 * "PortalModal"), opened from the "Portal Login" button in
 * `Header`/`MobileNavigation`. Rendered once from `Header` (mirroring
 * Figma's `App.tsx`, where `<PortalModal />` sits once at the shell
 * level, not per-trigger) and controlled by state that lives in
 * `Header` — see that file's doc comment.
 *
 * Product decision (resolved, see reference doc §5.1): each of the
 * four portal roles is an **external link out to the TuitionSchool
 * domain**, not an in-app route — TuitionSchool is a separate project
 * with its own auth/roles, and this Website module only deep-links
 * into it. No real TuitionSchool portal subdomain has been assigned
 * yet, so `PORTAL_ROLE_BASE_URL` below is a clearly-placeholder
 * external URL (frontend-owned, same convention as every other
 * placeholder in this codebase) rather than a `href="#"` (§ "no
 * placeholder code") — swapping in the real domain later is a
 * one-line change in this file only.
 *
 * No dialog/portal-primitive dependency exists yet in this project
 * (`package.json` has no Radix Dialog), so this is a small hand-rolled
 * modal: `createPortal` into `document.body` for correct stacking,
 * `Escape`-to-close and backdrop-click-to-close (mirroring
 * `MobileNavigation`'s existing `Escape` handling), and focus moved to
 * the dialog on open / returned to the trigger on close (§26 "correct
 * focus/state management").
 */

const PORTAL_ROLE_BASE_URL = "https://portal.tuitionschool.ir";

interface PortalRole {
  id: string;
  title: string;
  tag: string;
  description: string;
  icon: LucideIcon;
}

const PORTAL_ROLES: PortalRole[] = [
  {
    id: "parent",
    title: "پرتال والدین",
    tag: "ویژه خانواده‌ها",
    description: "پیگیری وضعیت تحصیلی، حضور و غیاب و ارتباط با مدرسه.",
    icon: Users,
  },
  {
    id: "teacher",
    title: "پرتال معلمان",
    tag: "ویژه کادر آموزشی",
    description: "ثبت نمرات، برنامه‌ی کلاسی و ارتباط با دانش‌آموزان.",
    icon: GraduationCap,
  },
  {
    id: "staff",
    title: "پرتال کارکنان مدرسه",
    tag: "ویژه کارکنان",
    description: "دسترسی به ابزارهای اداری و اطلاعیه‌های داخلی مدرسه.",
    icon: Building2,
  },
  {
    id: "admin",
    title: "پرتال مدیریت",
    tag: "ویژه مدیران",
    description: "مدیریت کلی مجموعه، گزارش‌ها و تنظیمات سطح مدیریتی.",
    icon: ShieldCheck,
  },
];

const PORTAL_MODAL_TITLE_ID = "portal-modal-heading";

export function PortalModal({ open, onClose }: PortalModalProps) {
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<Element | null>(null);

  React.useEffect(() => {
    if (!open) return;

    triggerRef.current = document.activeElement;
    dialogRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (triggerRef.current instanceof HTMLElement) {
        triggerRef.current.focus();
      }
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-primary/60 backdrop-blur-sm animate-in fade-in duration-200"
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={PORTAL_MODAL_TITLE_ID}
        tabIndex={-1}
        className={cn(
          "relative z-10 w-full max-w-2xl rounded-2xl bg-background p-6 shadow-2xl outline-none",
          "animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200 sm:p-8",
        )}
      >
        <button
          type="button"
          onClick={onClose}
          className={cn(
            "absolute end-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground",
            "hover:bg-muted hover:text-foreground",
            FOCUS_RING_CLASSNAME,
          )}
        >
          <X className="h-4 w-4" aria-hidden="true" />
          <VisuallyHidden>بستن</VisuallyHidden>
        </button>

        <div className="mb-6 max-w-md pe-8">
          <Heading id={PORTAL_MODAL_TITLE_ID} level={2} className="text-xl sm:text-2xl">
            ورود به پورتال
          </Heading>
          <Text variant="bodySm" color="muted" className="mt-1">
            پورتال مناسب نقش خود را انتخاب کنید. هر پورتال در سامانه‌ی جداگانه‌ی مدیریت آموزشگاه باز
            می‌شود.
          </Text>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {PORTAL_ROLES.map((role) => (
            <a
              key={role.id}
              href={`${PORTAL_ROLE_BASE_URL}/${role.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "group flex flex-col gap-3 rounded-xl border border-border p-4 text-start transition-colors",
                "hover:border-accent hover:bg-accent/5",
                FOCUS_RING_CLASSNAME,
              )}
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/8 text-primary transition-colors group-hover:bg-primary group-hover:text-accent">
                <role.icon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
              </span>
              <span>
                <span className="block text-sm font-bold text-foreground">{role.title}</span>
                <span className="mt-0.5 block text-xs font-medium text-accent">{role.tag}</span>
              </span>
              <span className="text-xs leading-relaxed text-muted-foreground">
                {role.description}
              </span>
            </a>
          ))}
        </div>

        <Text variant="caption" color="muted" className="mt-6 text-center">
          مشکل در دسترسی دارید؟{" "}
          <Link href="/contact" className="text-accent underline-offset-4 hover:underline">
            با پشتیبانی فناوری اطلاعات تماس بگیرید
          </Link>
        </Text>
      </div>
    </div>,
    document.body,
  );
}
