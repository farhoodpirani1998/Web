/**
 * Public surface of the `navigation` feature.
 *
 * Per §30/§32 ("features never reach into another feature's
 * internals"), other layers import these only from here. Data layer
 * only for now — no section/UI component lives in this feature yet
 * (see `./types.ts` doc comment).
 */
export { fetchNavigation } from "./api";
export { useNavigation, navigationQueryKey } from "./useNavigation";
export type { Navigation, NavigationItem } from "./types";
