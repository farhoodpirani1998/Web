import { useEffect, useId, useRef, useState, type FormEvent } from "react";

import { PermissionGate } from "@/components/ui/PermissionGate";
import { UnsavedChangesDialog } from "@/components/ui/UnsavedChangesDialog";
import { MediaPicker, useMediaById } from "@/features/cms/media";
import { useIsDirty, useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import { ApiError } from "@/lib/apiError";

import {
  updateContactSettings,
  updateFeatureFlags,
  updateGeneralSettings,
  updateSocialLinks,
} from "./api";
import type {
  CmsSiteSettings,
  CmsSocialLink,
  CmsSocialPlatform,
  UpdateContactSettingsPayload,
  UpdateGeneralSettingsPayload,
} from "./types";

/**
 * Site Settings form — General/Contact/Social/Feature-Flags sections,
 * each with its own independent Save action, mirroring the backend's
 * own split (`SiteSettingsController` has one PATCH endpoint per
 * section, not one PATCH for the whole row — see that controller's
 * doc comment). Saving one section does not touch the others, same as
 * the backend enforces.
 *
 * All four sections are internal (non-exported) components in this
 * one file rather than separate files — per this sprint's constraint
 * not to create generic/reusable components ahead of a second module
 * needing them, and nothing outside this page needs them individually.
 *
 * Gated one level up (`SiteSettingsPage`) behind `website.content:read`
 * for the whole page; General/Contact/Social's Save buttons are
 * additionally gated behind `website.content:write` here, matching
 * their `SiteSettingsController` PATCH route's own guard.
 * Feature-Flags' Save button is gated behind
 * `website.feature_flags:manage` instead — that section's own PATCH
 * route uses a different permission (see `FeatureFlagsSection`).
 */
export interface SettingsFormProps {
  settings: CmsSiteSettings;
  onSaved: (settings: CmsSiteSettings) => void;
}

export function SettingsForm({ settings, onSaved }: SettingsFormProps) {
  return (
    <div className="flex flex-col gap-8">
      <GeneralSection settings={settings} onSaved={onSaved} />
      <ContactSection settings={settings} onSaved={onSaved} />
      <SocialSection settings={settings} onSaved={onSaved} />
      <FeatureFlagsSection settings={settings} onSaved={onSaved} />
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* General                                                           */
/* ---------------------------------------------------------------- */

/**
 * `siteName.fa` is the only required field, matching
 * `UpdateGeneralSettingsDto` (`fa` mandatory on the nested
 * `TranslatableTextDto`, `Locale.FA` is `DEFAULT_LOCALE` server-side).
 * `tagline` is only sent when its `fa` value is non-empty: the DTO's
 * nested validation requires `fa` to be non-empty *if* `tagline` is
 * sent at all, so there is no way to explicitly clear an
 * already-set tagline via this endpoint — omitting it here simply
 * leaves it unchanged, it does not attempt to fake a clear.
 *
 * `logoMediaId`/`faviconMediaId` are always sent (whether changed or
 * not): `SiteSettingsService.swapMedia` is a no-op when the value
 * equals the previous one, so re-sending the current id is harmless,
 * and it's what lets an explicit `null` (from "Remove") actually clear
 * the reference.
 */
function GeneralSection({ settings, onSaved }: SettingsFormProps) {
  const siteNameFaId = useId();
  const siteNameEnId = useId();
  const taglineFaId = useId();
  const taglineEnId = useId();

  const [siteNameFa, setSiteNameFa] = useState(settings.siteName.fa);
  const [siteNameEn, setSiteNameEn] = useState(settings.siteName.en ?? "");
  const [taglineFa, setTaglineFa] = useState(settings.tagline?.fa ?? "");
  const [taglineEn, setTaglineEn] = useState(settings.tagline?.en ?? "");
  const [logoMediaId, setLogoMediaId] = useState<string | null>(settings.logoMediaId ?? null);
  const [faviconMediaId, setFaviconMediaId] = useState<string | null>(
    settings.faviconMediaId ?? null,
  );
  const [activePicker, setActivePicker] = useState<"logo" | "favicon" | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isDirty, resetBaseline } = useIsDirty({
    siteNameFa,
    siteNameEn,
    taglineFa,
    taglineEn,
    logoMediaId,
    faviconMediaId,
  });
  // No Cancel button on this always-visible, save-in-place section —
  // `guardedAction` is never called here, only the `beforeunload`/
  // in-app-route-blocker half of the pattern (see `CtaForm`'s
  // matching comment).
  const { isConfirmOpen, confirmLeave, cancelLeave } = useUnsavedChangesGuard(isDirty);

  const canSubmit = siteNameFa.trim().length > 0 && !isSaving;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setError(null);
    setIsSaving(true);

    const trimmedSiteNameEn = siteNameEn.trim();
    const trimmedTaglineFa = taglineFa.trim();
    const trimmedTaglineEn = taglineEn.trim();

    const payload: UpdateGeneralSettingsPayload = {
      siteName: {
        fa: siteNameFa.trim(),
        ...(trimmedSiteNameEn ? { en: trimmedSiteNameEn } : {}),
      },
      ...(trimmedTaglineFa
        ? { tagline: { fa: trimmedTaglineFa, ...(trimmedTaglineEn ? { en: trimmedTaglineEn } : {}) } }
        : {}),
      logoMediaId,
      faviconMediaId,
    };

    try {
      const saved = await updateGeneralSettings(payload);
      onSaved(saved);
      resetBaseline();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
      <h2 className="text-base font-semibold text-slate-900">General</h2>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={siteNameFaId} className="text-sm font-medium text-slate-900">
          Site name (Farsi)
        </label>
        <input
          id={siteNameFaId}
          type="text"
          dir="rtl"
          required
          value={siteNameFa}
          onChange={(event) => setSiteNameFa(event.target.value)}
          disabled={isSaving}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={siteNameEnId} className="text-sm font-medium text-slate-900">
          Site name (English) <span className="font-normal text-slate-400">— optional</span>
        </label>
        <input
          id={siteNameEnId}
          type="text"
          value={siteNameEn}
          onChange={(event) => setSiteNameEn(event.target.value)}
          disabled={isSaving}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={taglineFaId} className="text-sm font-medium text-slate-900">
          Tagline (Farsi) <span className="font-normal text-slate-400">— optional</span>
        </label>
        <input
          id={taglineFaId}
          type="text"
          dir="rtl"
          value={taglineFa}
          onChange={(event) => setTaglineFa(event.target.value)}
          disabled={isSaving}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={taglineEnId} className="text-sm font-medium text-slate-900">
          Tagline (English) <span className="font-normal text-slate-400">— optional</span>
        </label>
        <input
          id={taglineEnId}
          type="text"
          value={taglineEn}
          onChange={(event) => setTaglineEn(event.target.value)}
          disabled={isSaving}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <MediaField
          label="Logo"
          mediaId={logoMediaId}
          disabled={isSaving}
          onChoose={() => setActivePicker("logo")}
          onClear={() => setLogoMediaId(null)}
        />
        <MediaField
          label="Favicon"
          mediaId={faviconMediaId}
          disabled={isSaving}
          onChoose={() => setActivePicker("favicon")}
          onClear={() => setFaviconMediaId(null)}
        />
      </div>

      {error ? (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}

      <div>
        <PermissionGate permission="website.content:write">
          <button
            type="submit"
            disabled={!canSubmit}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isSaving ? "Saving…" : "Save general"}
          </button>
        </PermissionGate>
      </div>

      {activePicker ? (
        <MediaFieldPickerDialog
          onCancel={() => setActivePicker(null)}
          selectedId={activePicker === "logo" ? logoMediaId : faviconMediaId}
          onSelect={(media) => {
            if (activePicker === "logo") setLogoMediaId(media.id);
            else setFaviconMediaId(media.id);
            setActivePicker(null);
          }}
        />
      ) : null}

      {isConfirmOpen ? (
        <UnsavedChangesDialog onDiscard={confirmLeave} onKeepEditing={cancelLeave} />
      ) : null}
    </form>
  );
}

/**
 * One media-reference field (logo/favicon): a thumbnail of the
 * currently selected asset (resolved via `useMediaById`, same as any
 * other module with a `mediaId` field would), plus Choose/Remove
 * buttons. Not promoted to `features/cms/components/` — Site Settings
 * is the only module with a media-reference field so far, so nothing
 * has proven itself shared yet (same reasoning `features/cms/README.md`
 * gives for keeping `components/` empty today).
 */
function MediaField({
  label,
  mediaId,
  disabled,
  onChoose,
  onClear,
}: {
  label: string;
  mediaId: string | null;
  disabled: boolean;
  onChoose: () => void;
  onClear: () => void;
}) {
  const { media, isLoading } = useMediaById(mediaId);

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-slate-900">{label}</span>
      <div className="flex items-center gap-3">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-slate-50">
          {mediaId && isLoading ? (
            <span className="text-xs text-slate-400">…</span>
          ) : media ? (
            <img src={media.thumbnailUrl ?? media.url} alt={media.altText} className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs text-slate-400">None</span>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={onChoose}
            disabled={disabled}
            className="rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Choose…
          </button>
          {mediaId ? (
            <button
              type="button"
              onClick={onClear}
              disabled={disabled}
              className="rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Remove
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/**
 * Fixed-overlay wrapper around `MediaPicker` — same plain modal shape
 * as `features/cms/media/MediaUploadDialog.tsx` (see that file's
 * comment on why there's no shared `Dialog` primitive yet).
 * `MediaPicker` itself is only the permission-gated grid; this dialog
 * shell is specific to this field, not a generic reusable one.
 */
function MediaFieldPickerDialog({
  selectedId,
  onSelect,
  onCancel,
}: {
  selectedId: string | null;
  onSelect: (media: { id: string }) => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="flex max-h-[80vh] w-full max-w-2xl flex-col gap-4 overflow-y-auto rounded-lg border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Choose media</h2>
          <button
            type="button"
            onClick={onCancel}
            className="text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            Close
          </button>
        </div>

        <MediaPicker
          selectedId={selectedId}
          onSelect={onSelect}
          fallback={
            <p className="text-sm text-slate-600">
              Choosing media requires the Media permission. Contact an admin if you need access.
            </p>
          }
        />
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Contact                                                            */
/* ---------------------------------------------------------------- */

/**
 * `contactEmail`/`mapUrl`/`address` are only sent when non-empty:
 * `UpdateContactSettingsDto` validates them with `@IsEmail`/`@IsUrl`/
 * nested `MinLength(1)` respectively, none of which accept an empty
 * value, so there is no way to explicitly clear any of them via this
 * endpoint — omitting leaves each unchanged, same reasoning as
 * `tagline` in `GeneralSection`.
 *
 * `contactPhone` is the one field always sent as typed, including
 * empty: `@IsString()` with no `MinLength` accepts `""`, so clearing
 * the input and saving actually clears it server-side — same
 * "always send, including empty" convention `FaqForm` uses for
 * `category`.
 */
function ContactSection({ settings, onSaved }: SettingsFormProps) {
  const emailId = useId();
  const phoneId = useId();
  const addressFaId = useId();
  const addressEnId = useId();
  const mapUrlId = useId();

  const [contactEmail, setContactEmail] = useState(settings.contactEmail ?? "");
  const [contactPhone, setContactPhone] = useState(settings.contactPhone ?? "");
  const [addressFa, setAddressFa] = useState(settings.address?.fa ?? "");
  const [addressEn, setAddressEn] = useState(settings.address?.en ?? "");
  const [mapUrl, setMapUrl] = useState(settings.mapUrl ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isDirty, resetBaseline } = useIsDirty({
    contactEmail,
    contactPhone,
    addressFa,
    addressEn,
    mapUrl,
  });
  const { isConfirmOpen, confirmLeave, cancelLeave } = useUnsavedChangesGuard(isDirty);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving) return;

    setError(null);
    setIsSaving(true);

    const trimmedEmail = contactEmail.trim();
    const trimmedAddressFa = addressFa.trim();
    const trimmedAddressEn = addressEn.trim();
    const trimmedMapUrl = mapUrl.trim();

    const payload: UpdateContactSettingsPayload = {
      ...(trimmedEmail ? { contactEmail: trimmedEmail } : {}),
      contactPhone: contactPhone.trim(),
      ...(trimmedAddressFa
        ? { address: { fa: trimmedAddressFa, ...(trimmedAddressEn ? { en: trimmedAddressEn } : {}) } }
        : {}),
      ...(trimmedMapUrl ? { mapUrl: trimmedMapUrl } : {}),
    };

    try {
      const saved = await updateContactSettings(payload);
      onSaved(saved);
      resetBaseline();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="flex flex-col gap-4 border-t border-slate-200 pt-6" onSubmit={handleSubmit} noValidate>
      <h2 className="text-base font-semibold text-slate-900">Contact</h2>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={emailId} className="text-sm font-medium text-slate-900">
          Contact email <span className="font-normal text-slate-400">— optional</span>
        </label>
        <input
          id={emailId}
          type="email"
          value={contactEmail}
          onChange={(event) => setContactEmail(event.target.value)}
          disabled={isSaving}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={phoneId} className="text-sm font-medium text-slate-900">
          Contact phone <span className="font-normal text-slate-400">— optional</span>
        </label>
        <input
          id={phoneId}
          type="text"
          value={contactPhone}
          onChange={(event) => setContactPhone(event.target.value)}
          disabled={isSaving}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={addressFaId} className="text-sm font-medium text-slate-900">
          Address (Farsi) <span className="font-normal text-slate-400">— optional</span>
        </label>
        <input
          id={addressFaId}
          type="text"
          dir="rtl"
          value={addressFa}
          onChange={(event) => setAddressFa(event.target.value)}
          disabled={isSaving}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={addressEnId} className="text-sm font-medium text-slate-900">
          Address (English) <span className="font-normal text-slate-400">— optional</span>
        </label>
        <input
          id={addressEnId}
          type="text"
          value={addressEn}
          onChange={(event) => setAddressEn(event.target.value)}
          disabled={isSaving}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={mapUrlId} className="text-sm font-medium text-slate-900">
          Map URL <span className="font-normal text-slate-400">— optional</span>
        </label>
        <input
          id={mapUrlId}
          type="url"
          value={mapUrl}
          onChange={(event) => setMapUrl(event.target.value)}
          disabled={isSaving}
          placeholder="https://maps.google.com/…"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
        />
      </div>

      {error ? (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}

      <div>
        <PermissionGate permission="website.content:write">
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isSaving ? "Saving…" : "Save contact"}
          </button>
        </PermissionGate>
      </div>

      {isConfirmOpen ? (
        <UnsavedChangesDialog onDiscard={confirmLeave} onKeepEditing={cancelLeave} />
      ) : null}
    </form>
  );
}

/* ---------------------------------------------------------------- */
/* Social                                                             */
/* ---------------------------------------------------------------- */

const SOCIAL_PLATFORM_OPTIONS: { label: string; value: CmsSocialPlatform }[] = [
  { label: "Instagram", value: "instagram" },
  { label: "Telegram", value: "telegram" },
  { label: "WhatsApp", value: "whatsapp" },
  { label: "Eitaa", value: "eitaa" },
  { label: "YouTube", value: "youtube" },
  { label: "LinkedIn", value: "linkedin" },
  { label: "Twitter", value: "twitter" },
  { label: "Facebook", value: "facebook" },
];

/**
 * Replaces the whole `socialLinks` array on save, matching
 * `UpdateSocialLinksDto`'s own "full replace, not per-entry patch"
 * semantics — see that DTO's comment. Rows with an empty `url` are
 * dropped before sending rather than submitted as invalid entries
 * (`SocialLinkDto.url` is `@IsUrl`-validated, so an empty string would
 * just fail server-side).
 */
function SocialSection({ settings, onSaved }: SettingsFormProps) {
  const [links, setLinks] = useState<CmsSocialLink[]>(settings.socialLinks);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isDirty, resetBaseline } = useIsDirty(links);
  const { isConfirmOpen, confirmLeave, cancelLeave } = useUnsavedChangesGuard(isDirty);

  // `links` is resynced from the server's response on a successful
  // save (below), which lands one render *after* this handler runs —
  // `resetBaseline` closes over whatever `links` was on the render
  // that created it, so calling it inline here would re-baseline
  // against the stale pre-save value. Defer to the render where
  // `links` has actually become the saved value instead.
  const pendingBaselineReset = useRef(false);
  useEffect(() => {
    if (pendingBaselineReset.current) {
      pendingBaselineReset.current = false;
      resetBaseline();
    }
  }, [links, resetBaseline]);

  function addLink() {
    setLinks((current) => [...current, { platform: "instagram", url: "" }]);
  }

  function removeLink(index: number) {
    setLinks((current) => current.filter((_, i) => i !== index));
  }

  function updateLink(index: number, patch: Partial<CmsSocialLink>) {
    setLinks((current) => current.map((link, i) => (i === index ? { ...link, ...patch } : link)));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving) return;

    setError(null);
    setIsSaving(true);

    const cleaned = links
      .map((link) => ({ platform: link.platform, url: link.url.trim() }))
      .filter((link) => link.url.length > 0);

    try {
      const saved = await updateSocialLinks({ socialLinks: cleaned });
      onSaved(saved);
      pendingBaselineReset.current = true;
      setLinks(saved.socialLinks);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="flex flex-col gap-4 border-t border-slate-200 pt-6" onSubmit={handleSubmit} noValidate>
      <h2 className="text-base font-semibold text-slate-900">Social links</h2>

      <div className="flex flex-col gap-3">
        {links.length === 0 ? (
          <p className="text-sm text-slate-500">No social links yet.</p>
        ) : (
          links.map((link, index) => (
            <div key={index} className="flex items-center gap-2">
              <select
                value={link.platform}
                onChange={(event) =>
                  updateLink(index, { platform: event.target.value as CmsSocialPlatform })
                }
                disabled={isSaving}
                className="rounded-md border border-slate-300 px-2 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
              >
                {SOCIAL_PLATFORM_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <input
                type="url"
                value={link.url}
                onChange={(event) => updateLink(index, { url: event.target.value })}
                disabled={isSaving}
                placeholder="https://…"
                className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
              />
              <button
                type="button"
                onClick={() => removeLink(index)}
                disabled={isSaving}
                aria-label="Remove"
                className="rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>

      <div>
        <button
          type="button"
          onClick={addLink}
          disabled={isSaving}
          className="rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Add link
        </button>
      </div>

      {error ? (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}

      <div>
        <PermissionGate permission="website.content:write">
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isSaving ? "Saving…" : "Save social links"}
          </button>
        </PermissionGate>
      </div>

      {isConfirmOpen ? (
        <UnsavedChangesDialog onDiscard={confirmLeave} onKeepEditing={cancelLeave} />
      ) : null}
    </form>
  );
}

/* ---------------------------------------------------------------- */
/* Feature flags                                                     */
/* ---------------------------------------------------------------- */

/**
 * Exposes only `featureFlags.ctaEnabled` — the CTA module's own
 * on/off switch (`CtaBanner`/`CtaController` entity doc: "gated by
 * SiteFeatureFlags.ctaEnabled ... not every site needs a bottom-of-page
 * pitch banner"). The other flags (`newsEnabled`, `galleryEnabled`,
 * `testimonialsEnabled`, `faqEnabled`, `eventsEnabled`) are real
 * fields on `CmsSiteFeatureFlags`/`UpdateFeatureFlagsPayload` but have
 * no control here yet — add one each if/when that's actually needed,
 * matching this file's "don't build ahead of a real need" convention
 * (see `SettingsForm`'s own top comment).
 *
 * Gated behind `website.feature_flags:manage`, not `content:write` —
 * `SiteSettingsController.updateFeatureFlags`'s own guard uses that
 * distinct permission, so this is the one section on this page where
 * the Save button's `PermissionGate` differs from every other
 * section's.
 *
 * A single checkbox toggling one boolean field, not a full form
 * (nothing to type, nothing to validate) — same plain-checkbox
 * treatment `AboutForm`'s `noindex` field already uses.
 */
function FeatureFlagsSection({ settings, onSaved }: SettingsFormProps) {
  const ctaEnabledId = useId();

  const [ctaEnabled, setCtaEnabled] = useState(settings.featureFlags.ctaEnabled);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isDirty, resetBaseline } = useIsDirty(ctaEnabled);
  const { isConfirmOpen, confirmLeave, cancelLeave } = useUnsavedChangesGuard(isDirty);

  // Same "resync lands a render later" reasoning as `SocialSection`.
  const pendingBaselineReset = useRef(false);
  useEffect(() => {
    if (pendingBaselineReset.current) {
      pendingBaselineReset.current = false;
      resetBaseline();
    }
  }, [ctaEnabled, resetBaseline]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving) return;

    setError(null);
    setIsSaving(true);

    try {
      const saved = await updateFeatureFlags({ ctaEnabled });
      onSaved(saved);
      pendingBaselineReset.current = true;
      setCtaEnabled(saved.featureFlags.ctaEnabled);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form
      className="flex flex-col gap-4 border-t border-slate-200 pt-6"
      onSubmit={handleSubmit}
      noValidate
    >
      <h2 className="text-base font-semibold text-slate-900">Feature flags</h2>

      <label htmlFor={ctaEnabledId} className="flex items-center gap-2 text-sm text-slate-900">
        <input
          id={ctaEnabledId}
          type="checkbox"
          checked={ctaEnabled}
          onChange={(event) => setCtaEnabled(event.target.checked)}
          disabled={isSaving}
          className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
        />
        Show the CTA banner section on the public site
      </label>

      {error ? (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}

      <div>
        <PermissionGate permission="website.feature_flags:manage">
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isSaving ? "Saving…" : "Save feature flags"}
          </button>
        </PermissionGate>
      </div>

      {isConfirmOpen ? (
        <UnsavedChangesDialog onDiscard={confirmLeave} onKeepEditing={cancelLeave} />
      ) : null}
    </form>
  );
}
