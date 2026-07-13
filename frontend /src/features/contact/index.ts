/**
 * Public surface of the `contact` feature.
 *
 * Per §30/§32 ("features never reach into another feature's
 * internals"), other layers (pages, other features) import these
 * section components only from here — never from the individual
 * `./ContactIntro`, `./ContactInfo` files directly.
 */
export { ContactIntro } from "./ContactIntro";
export { ContactInfo } from "./ContactInfo";
