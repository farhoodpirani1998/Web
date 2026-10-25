import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CmsAdminUser } from './entities/admin-user.entity';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';
import { PasswordHasherService } from '../auth/password/password-hasher.service';
import {
  ROLE_PERMISSIONS,
  WebsitePermission,
  WebsiteRole,
} from '../../auth/website-role.enum';

/**
 * CRUD for CMS admin accounts. Every write is guarded against the two
 * ways an admin could lock the whole CMS out of itself:
 *
 * 1. **Removing the last active super-admin** — deleting, deactivating,
 *    or demoting (`role` away from SUPER_ADMIN) the only remaining
 *    active super-admin would leave nobody able to manage content or
 *    admins. Rejected with a 409.
 * 2. **Self-lockout** — an admin can't deactivate or delete *their own*
 *    account through this API (a 400). This keeps a stray click from
 *    ending the current session's access.
 *
 * These are application-level checks, not DB constraints, because they
 * depend on "how many other active super-admins exist right now" — a
 * query, not a row invariant.
 */
@Injectable()
export class AdminUsersService {
  constructor(
    @InjectRepository(CmsAdminUser)
    private readonly adminRepo: Repository<CmsAdminUser>,
    private readonly passwordHasher: PasswordHasherService,
  ) {}

  async findAll(): Promise<AdminUserSummary[]> {
    const admins = await this.adminRepo.find({ order: { createdAt: 'ASC' } });
    return admins.map((admin) => this.toSummary(admin));
  }

  async findOne(id: string): Promise<AdminUserSummary> {
    return this.toSummary(await this.getOrFail(id));
  }

  async create(dto: CreateAdminUserDto): Promise<AdminUserSummary> {
    const existing = await this.adminRepo.findOne({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('An admin with this email already exists');
    }

    const passwordHash = await this.passwordHasher.hash(dto.password);
    const admin = await this.adminRepo.save(
      this.adminRepo.create({
        email: dto.email,
        passwordHash,
        role: dto.role,
        isActive: true,
      }),
    );
    return this.toSummary(admin);
  }

  async update(
    id: string,
    dto: UpdateAdminUserDto,
    actingAdminId: string,
  ): Promise<AdminUserSummary> {
    const admin = await this.getOrFail(id);

    // Demoting the last active super-admin would strand the CMS.
    if (
      dto.role !== undefined &&
      dto.role !== WebsiteRole.SUPER_ADMIN &&
      admin.role === WebsiteRole.SUPER_ADMIN
    ) {
      await this.assertNotLastActiveSuperAdmin(id, 'change the role of');
    }

    // Deactivating the last active super-admin is the same lockout risk.
    if (dto.isActive === false && admin.role === WebsiteRole.SUPER_ADMIN) {
      await this.assertNotLastActiveSuperAdmin(id, 'deactivate');
    }

    // Don't let an admin deactivate their own session out from under itself.
    if (dto.isActive === false && id === actingAdminId) {
      throw new BadRequestException('You cannot deactivate your own account');
    }

    if (dto.role !== undefined) admin.role = dto.role;
    if (dto.isActive !== undefined) admin.isActive = dto.isActive;

    return this.toSummary(await this.adminRepo.save(admin));
  }

  async remove(id: string, actingAdminId: string): Promise<void> {
    const admin = await this.getOrFail(id);

    if (id === actingAdminId) {
      throw new BadRequestException('You cannot delete your own account');
    }
    if (admin.role === WebsiteRole.SUPER_ADMIN) {
      await this.assertNotLastActiveSuperAdmin(id, 'delete');
    }

    await this.adminRepo.delete({ id });
  }

  /** Used by `CmsAuthService`-adjacent change-password flow; returns the fresh hash to persist. */
  hashPassword(plain: string): Promise<string> {
    return this.passwordHasher.hash(plain);
  }

  private async getOrFail(id: string): Promise<CmsAdminUser> {
    const admin = await this.adminRepo.findOne({ where: { id } });
    if (!admin) throw new NotFoundException('Admin not found');
    return admin;
  }

  /**
   * Throws unless there is at least one *other* active super-admin besides
   * `excludeId`. Called before any change that would remove `excludeId`
   * from the active-super-admin pool.
   */
  private async assertNotLastActiveSuperAdmin(
    excludeId: string,
    verb: string,
  ): Promise<void> {
    // Count active super-admins *other than* the row we're about to change.
    // Zero means the target is the only one left — removing it would strand
    // the CMS with nobody able to manage content or admins.
    const othersExcludingTarget = await this.adminRepo
      .createQueryBuilder('a')
      .where('a.role = :role', { role: WebsiteRole.SUPER_ADMIN })
      .andWhere('a.isActive = true')
      .andWhere('a.id != :id', { id: excludeId })
      .getCount();
    if (othersExcludingTarget === 0) {
      throw new ConflictException(
        `Cannot ${verb} the last active super-admin — promote another admin first`,
      );
    }
  }

  private toSummary(admin: CmsAdminUser): AdminUserSummary {
    return {
      id: admin.id,
      email: admin.email,
      role: admin.role,
      isActive: admin.isActive,
      permissions: ROLE_PERMISSIONS[admin.role] ?? [],
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
    };
  }
}

export interface AdminUserSummary {
  id: string;
  email: string;
  role: WebsiteRole;
  isActive: boolean;
  permissions: WebsitePermission[];
  createdAt: Date;
  updatedAt: Date;
}
