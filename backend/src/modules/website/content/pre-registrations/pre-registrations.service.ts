import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PreRegistration } from './entities/pre-registration.entity';
import { PreRegistrationStatus } from './entities/pre-registration-status.enum';
import { CreatePreRegistrationDto } from './dto/create-pre-registration.dto';
import { SiteService } from '../../core/site/site.service';

/**
 * Create + admin list/read/status/delete for Pre-Registration
 * submissions. Shaped after `PortalLinksService` — no `OrderingService`
 * (no manually-ordered `position`, sorted by `createdAt` instead) and
 * no `PublishingService` (status here is plain triage, not a governed
 * publish transition — see `PreRegistrationStatus`'s own doc comment),
 * so `updateStatus` just assigns and saves rather than delegating to a
 * transition-validation service the way `FaqService.updateStatus` does.
 */
@Injectable()
export class PreRegistrationsService {
  constructor(
    @InjectRepository(PreRegistration)
    private readonly repo: Repository<PreRegistration>,
    private readonly siteService: SiteService,
  ) {}

  /** Called from the public, unauthenticated submit endpoint — see `PublicPreRegistrationController`. */
  async create(dto: CreatePreRegistrationDto): Promise<PreRegistration> {
    const siteId = this.siteService.getDefaultSiteId();

    return this.repo.save(
      this.repo.create({
        siteId,
        studentFirstName: dto.studentFirstName,
        studentLastName: dto.studentLastName,
        studentNationalId: dto.studentNationalId,
        studentBirthDate: dto.studentBirthDate,
        studentGrade: dto.studentGrade,
        guardianFullName: dto.guardianFullName,
        guardianPhone: dto.guardianPhone,
        guardianEmail: dto.guardianEmail,
        notes: dto.notes,
        status: PreRegistrationStatus.NEW,
      }),
    );
  }

  /** Newest submissions first — there is no manual ordering for this list. */
  async findAll(status?: PreRegistrationStatus): Promise<PreRegistration[]> {
    const siteId = this.siteService.getDefaultSiteId();
    return this.repo.find({
      where: { siteId, ...(status ? { status } : {}) },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<PreRegistration> {
    return this.repo.findOneByOrFail({ id });
  }

  async updateStatus(id: string, status: PreRegistrationStatus): Promise<PreRegistration> {
    const preRegistration = await this.findOne(id);
    preRegistration.status = status;
    return this.repo.save(preRegistration);
  }

  async remove(id: string): Promise<void> {
    await this.repo.delete({ id });
  }
}
