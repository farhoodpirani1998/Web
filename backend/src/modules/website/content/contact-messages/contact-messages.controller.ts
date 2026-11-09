import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
} from '@nestjs/common';
import { RequireCmsPermission } from '../../identity/auth/cms-permission.decorator';
import { WebsitePermission } from '../../auth/website-role.enum';
import { UpdateContactMessageStatusDto } from './dto/update-contact-message-status.dto';
import { ContactMessagesService } from './contact-messages.service';

@Controller('admin/contact-messages')
export class ContactMessagesController {
  constructor(private readonly contactMessages: ContactMessagesService) {}

  @Get()
  @RequireCmsPermission(WebsitePermission.CONTENT_READ)
  findAll() {
    return this.contactMessages.findAll();
  }

  @Patch(':id/status')
  @RequireCmsPermission(WebsitePermission.CONTENT_WRITE)
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateContactMessageStatusDto,
  ) {
    return this.contactMessages.updateStatus(id, dto.status);
  }

  @Delete(':id')
  @RequireCmsPermission(WebsitePermission.CONTENT_WRITE)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.contactMessages.remove(id);
  }
}
