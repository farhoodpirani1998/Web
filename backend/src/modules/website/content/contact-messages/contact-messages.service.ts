import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SiteService } from '../../core/site/site.service';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';
import { ContactMessageStatus } from './entities/contact-message-status.enum';
import { ContactMessage } from './entities/contact-message.entity';

@Injectable()
export class ContactMessagesService {
  constructor(
    @InjectRepository(ContactMessage)
    private readonly repo: Repository<ContactMessage>,
    private readonly siteService: SiteService,
  ) {}

  async create(dto: CreateContactMessageDto): Promise<void> {
    const siteId = this.siteService.getDefaultSiteId();
    await this.repo.save(
      this.repo.create({
        siteId,
        fullName: dto.fullName.trim(),
        phone: dto.phone.trim(),
        subject: dto.subject,
        message: dto.message.trim(),
        status: ContactMessageStatus.NEW,
      }),
    );
  }

  async findAll(): Promise<ContactMessage[]> {
    const siteId = this.siteService.getDefaultSiteId();
    return this.repo.find({
      where: { siteId },
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(
    id: string,
    status: ContactMessageStatus,
  ): Promise<ContactMessage> {
    const siteId = this.siteService.getDefaultSiteId();
    const message = await this.repo.findOneBy({ id, siteId });
    if (!message) throw new NotFoundException();
    message.status = status;
    return this.repo.save(message);
  }

  async remove(id: string): Promise<void> {
    const siteId = this.siteService.getDefaultSiteId();
    const result = await this.repo.delete({ id, siteId });
    if (!result.affected) throw new NotFoundException();
  }
}
