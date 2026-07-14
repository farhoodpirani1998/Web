/**
 * Public surface of the `pre-registration` feature.
 *
 * Per §30/§32 ("features never reach into another feature's
 * internals"), other layers (pages, other features) import these
 * section components only from here — never from the individual
 * section files directly.
 *
 * `SuccessState` is exported for future wiring (see its own file's
 * doc comment) but is not composed by `PreRegistrationPage` today.
 */
export { Hero } from "./Hero";
export { Information } from "./Information";
export { RegistrationForm } from "./RegistrationForm";
export { FAQ } from "./FAQ";
export { SuccessState } from "./SuccessState";
