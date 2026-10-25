/**
 * Public surface of the `testimonials` feature.
 *
 * Per §30/§32 ("features never reach into another feature's
 * internals"), other layers (pages) import `Testimonials` only from
 * here — never from `./Testimonials` directly.
 */
export { Testimonials } from "./Testimonials";

export { fetchTestimonials } from "./api";
export { useTestimonials, testimonialsQueryKey } from "./useTestimonials";
export type { Testimonials as TestimonialsData, TestimonialItem } from "./types";
