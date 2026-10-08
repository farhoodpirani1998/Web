/**
 * Public surface of the `cms/cta` feature.
 *
 * Other layers (pages, other CMS modules) should import from here
 * rather than reaching into `./api`, `./hooks/useCta`, etc. directly
 * — same convention as `features/cms/about/index.ts`.
 */
export type { CmsCta, CmsCtaStatus, UpdateCtaPayload } from "./types";
export { fetchCta, updateCta, updateCtaStatus } from "./api";
export { useCta, type UseCtaResult } from "./hooks/useCta";

export { CtaPage } from "./CtaPage";
export { CtaForm, type CtaFormProps } from "./CtaForm";
export { CtaStatusControl, type CtaStatusControlProps } from "./CtaStatusControl";
