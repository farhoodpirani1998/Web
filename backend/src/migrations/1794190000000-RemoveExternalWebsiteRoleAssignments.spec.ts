import { RemoveExternalWebsiteRoleAssignments1794190000000 } from './1794190000000-RemoveExternalWebsiteRoleAssignments';

describe('RemoveExternalWebsiteRoleAssignments1794190000000', () => {
  it('drops the legacy external-role table and enum', async () => {
    const queryRunner = {
      query: jest.fn().mockResolvedValue(undefined),
    } as any;

    await new RemoveExternalWebsiteRoleAssignments1794190000000().up(
      queryRunner,
    );

    expect(queryRunner.query).toHaveBeenNthCalledWith(
      1,
      'DROP TABLE IF EXISTS "website_role_assignments"',
    );
    expect(queryRunner.query).toHaveBeenNthCalledWith(
      2,
      'DROP TYPE IF EXISTS "website_role_assignments_role_enum"',
    );
  });

  it('recreates the empty table and enum when reverted', async () => {
    const queryRunner = {
      query: jest.fn().mockResolvedValue(undefined),
    } as any;

    await new RemoveExternalWebsiteRoleAssignments1794190000000().down(
      queryRunner,
    );

    expect(queryRunner.query).toHaveBeenCalledTimes(2);
    expect(queryRunner.query.mock.calls[0][0]).toContain(
      'CREATE TYPE "website_role_assignments_role_enum"',
    );
    expect(queryRunner.query.mock.calls[1][0]).toContain(
      'CREATE TABLE "website_role_assignments"',
    );
  });
});
