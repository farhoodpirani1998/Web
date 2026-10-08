import { ROLE_PERMISSIONS, WebsiteRole, WebsitePermission } from './website-role.enum';

describe('ROLE_PERMISSIONS', () => {
  it('defines an entry for every WebsiteRole', () => {
    for (const role of Object.values(WebsiteRole)) {
      expect(ROLE_PERMISSIONS[role]).toBeDefined();
    }
  });

  it('grants SUPER_ADMIN every permission', () => {
    const allPermissions = Object.values(WebsitePermission);
    expect(ROLE_PERMISSIONS[WebsiteRole.SUPER_ADMIN].sort()).toEqual(allPermissions.sort());
  });

  it('only grants CONTENT_PUBLISH to roles responsible for publishing', () => {
    const rolesWithPublish = Object.entries(ROLE_PERMISSIONS)
      .filter(([, perms]) => perms.includes(WebsitePermission.CONTENT_PUBLISH))
      .map(([role]) => role);

    expect(rolesWithPublish.sort()).toEqual(
      [WebsiteRole.SUPER_ADMIN, WebsiteRole.PUBLISHER].sort(),
    );
  });

  it('every non-super-admin role includes CONTENT_READ', () => {
    for (const role of Object.values(WebsiteRole)) {
      if (role === WebsiteRole.SUPER_ADMIN) continue;
      expect(ROLE_PERMISSIONS[role]).toContain(WebsitePermission.CONTENT_READ);
    }
  });
});
