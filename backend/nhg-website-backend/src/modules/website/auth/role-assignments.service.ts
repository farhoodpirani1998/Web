import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WebsiteRoleAssignment } from './entities/website-role-assignment.entity';
import { WebsiteRole } from './website-role.enum';

/**
 * The only writer of `website_role_assignments` — the table both
 * WebsitePermissionGuard and WebsiteSuperAdminGuard read from. Every
 * route that calls this service is gated by RequireWebsiteSuperAdmin,
 * never RequireWebsitePermission (see website-super-admin.guard.ts).
 */
@Injectable()
export class RoleAssignmentsService {
  constructor(
    @InjectRepository(WebsiteRoleAssignment)
    private readonly roleRepo: Repository<WebsiteRoleAssignment>,
  ) {}

  findAll(): Promise<WebsiteRoleAssignment[]> {
    return this.roleRepo.find({ order: { createdAt: 'ASC' } });
  }

  findOne(externalUserId: string): Promise<WebsiteRoleAssignment | null> {
    return this.roleRepo.findOne({ where: { externalUserId } });
  }

  /**
   * Upsert: assigns `role` to `externalUserId`, creating the row if it
   * doesn't exist yet or changing the role on the existing one
   * (@Unique(['externalUserId']) on the entity — one role per user).
   */
  async assign(externalUserId: string, role: WebsiteRole): Promise<WebsiteRoleAssignment> {
    const existing = await this.roleRepo.findOne({ where: { externalUserId } });

    if (existing) {
      if (existing.role === WebsiteRole.SUPER_ADMIN && role !== WebsiteRole.SUPER_ADMIN) {
        await this.assertNotLastSuperAdmin();
      }
      existing.role = role;
      return this.roleRepo.save(existing);
    }

    return this.roleRepo.save(this.roleRepo.create({ externalUserId, role }));
  }

  async remove(externalUserId: string): Promise<void> {
    const existing = await this.roleRepo.findOneByOrFail({ externalUserId });
    if (existing.role === WebsiteRole.SUPER_ADMIN) {
      await this.assertNotLastSuperAdmin();
    }
    await this.roleRepo.delete({ externalUserId });
  }

  /**
   * Prevents demoting/removing the last remaining Super Admin, which
   * would permanently lock every super-admin-only route (including
   * this one) behind a role nobody holds anymore.
   */
  private async assertNotLastSuperAdmin(): Promise<void> {
    const remaining = await this.roleRepo.count({
      where: { role: WebsiteRole.SUPER_ADMIN },
    });
    if (remaining <= 1) {
      throw new ConflictException('Cannot remove the last Website Super Admin');
    }
  }
}
