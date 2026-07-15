/**
 * Public surface of the `faq` feature.
 *
 * Per §30/§32 ("features never reach into another feature's
 * internals"), other layers (pages, other features) import these
 * from here — never from `./api`, `./useFaq`, or `./types` directly.
 */
export { fetchFaq } from "./api";
export { useFaq, faqQueryKey } from "./useFaq";
export type { Faq, FaqItem } from "./types";
