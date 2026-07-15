/**
 * Shared placeholder contact info (Website Frontend Architecture §4,
 * §8, §35 "does not invent backend functionality").
 *
 * `TopBar` and `Footer` both render the same phone/email/address —
 * previously each defined its own copy of these strings locally. Real
 * values are ultimately Site Settings content-module data (no such
 * Public API endpoint exists yet), so this stays a small frontend-owned
 * constants file rather than a data hook; swapping it for a
 * `useSiteSettings()`-style hook later only touches this one file.
 */

export const CONTACT_ADDRESS = "تهران، خیابان ولیعصر، پلاک ۱۲۳، طبقه ۲";
export const CONTACT_PHONE = "۰۲۱-۱۲۳۴۵۶۷۸";
export const CONTACT_PHONE_HREF = "tel:+982112345678";
export const CONTACT_EMAIL = "info@example.com";
export const CONTACT_EMAIL_HREF = "mailto:info@example.com";
