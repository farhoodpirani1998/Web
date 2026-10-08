/**
 * Public surface of the `cta` feature.
 *
 * Per §30/§32 ("features never reach into another feature's
 * internals"), other layers (pages, other features) import `CTA`
 * only from here — never from `./CTA` directly.
 */
export { CTA } from "./CTA";

export { fetchCTA } from "./api";
export { useCTA, ctaQueryKey } from "./useCTA";
export type { CTA as CTAData, CTALink } from "./types";
