/**
 * Public surface of the `features` feature.
 *
 * Per §30/§32 ("features never reach into another feature's
 * internals"), other layers (pages, other features) import `Features`
 * only from here — never from `./Features` directly.
 */
export { Features } from "./Features";

export { fetchFeatures } from "./api";
export { useFeatures, featuresQueryKey } from "./useFeatures";
export type { Features as FeaturesData, FeatureItem } from "./types";
