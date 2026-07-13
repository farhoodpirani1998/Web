/**
 * Public surface of the `hero` feature.
 *
 * Per §30/§32 ("features never reach into another feature's
 * internals"), other layers (pages, other features) import `Hero`
 * only from here — never from `./Hero` directly.
 */
export { Hero } from "./Hero";
