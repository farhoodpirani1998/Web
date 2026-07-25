/**
 * Public surface of the `cms/portal-links` feature.
 *
 * Other layers (pages, other CMS modules) should import from here
 * rather than reaching into `./api`, `./hooks/usePortalLinks`, etc.
 * directly — same convention as `features/cms/faq/index.ts`.
 */
export type { CmsPortalLink, CreatePortalLinkPayload, UpdatePortalLinkPayload } from "./types";
export {
  fetchPortalLinkList,
  fetchPortalLinkById,
  createPortalLink,
  updatePortalLink,
  deletePortalLink,
  reorderPortalLinks,
} from "./api";
export { usePortalLinks, type UsePortalLinksResult } from "./hooks/usePortalLinks";

export { PortalLinksPage } from "./PortalLinksPage";
export { PortalLinkList, type PortalLinkListProps } from "./PortalLinkList";
export { PortalLinkRow, type PortalLinkRowProps } from "./PortalLinkRow";
export { PortalLinkForm, type PortalLinkFormProps } from "./PortalLinkForm";
export { PortalLinkDeleteConfirm, type PortalLinkDeleteConfirmProps } from "./PortalLinkDeleteConfirm";
