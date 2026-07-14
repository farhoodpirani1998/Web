export enum WebsiteRole {
  SUPER_ADMIN = 'website_super_admin',
  CONTENT_EDITOR = 'content_editor',
  PUBLISHER = 'publisher',
  SEO_MARKETING_MANAGER = 'seo_marketing_manager',
  MEDIA_MANAGER = 'media_manager',
}

export enum WebsitePermission {
  CONTENT_READ = 'website.content:read',
  CONTENT_WRITE = 'website.content:write',
  CONTENT_PUBLISH = 'website.content:publish',
  MEDIA_MANAGE = 'website.media:manage',
  SEO_MANAGE = 'website.seo:manage',
  FEATURE_FLAGS_MANAGE = 'website.feature_flags:manage',
  REVISIONS_VIEW = 'website.revisions:view',
  REVISIONS_RESTORE = 'website.revisions:restore',
}

/**
 * A small, fixed role -> permission map — deliberately not a dynamic
 * RBAC engine. This backend's authorization needs are simple (a handful
 * of editorial roles); building a generic permission-management UI here
 * would be speculative complexity, same philosophy as the Feature Flags
 * design (fixed set, not user-configurable).
 */
export const ROLE_PERMISSIONS: Record<WebsiteRole, WebsitePermission[]> = {
  [WebsiteRole.SUPER_ADMIN]: Object.values(WebsitePermission),
  [WebsiteRole.CONTENT_EDITOR]: [
    WebsitePermission.CONTENT_READ,
    WebsitePermission.CONTENT_WRITE,
    WebsitePermission.REVISIONS_VIEW,
  ],
  [WebsiteRole.PUBLISHER]: [
    WebsitePermission.CONTENT_READ,
    WebsitePermission.CONTENT_WRITE,
    WebsitePermission.CONTENT_PUBLISH,
    WebsitePermission.REVISIONS_VIEW,
    WebsitePermission.REVISIONS_RESTORE,
  ],
  [WebsiteRole.SEO_MARKETING_MANAGER]: [
    WebsitePermission.CONTENT_READ,
    WebsitePermission.SEO_MANAGE,
  ],
  [WebsiteRole.MEDIA_MANAGER]: [
    WebsitePermission.CONTENT_READ,
    WebsitePermission.MEDIA_MANAGE,
  ],
};
