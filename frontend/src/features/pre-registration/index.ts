/**
 * Public surface of the `pre-registration` feature.
 *
 * Per §30/§32 ("features never reach into another feature's
 * internals"), other layers (pages, other features) import these
 * section components only from here — never from the individual
 * section files directly.
 *
 * `SuccessState` is now composed internally by `RegistrationForm`
 * (rendered in place of the form after a successful submission) — it
 * remains exported here too since it's a standalone presentational
 * component other callers could reuse.
 */
export { Hero } from "./Hero";
export { Information } from "./Information";
export { RegistrationForm } from "./RegistrationForm";
export { FAQ } from "./FAQ";
export { SuccessState } from "./SuccessState";
export { submitPreRegistration } from "./api";
export type { PreRegistrationPayload } from "./types";
