import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ContactMessagesService } from '../../content/contact-messages/contact-messages.service';
import { CreateContactMessageDto } from '../../content/contact-messages/dto/create-contact-message.dto';
import { PUBLIC_FORM_THROTTLE } from '../common/public-rate-limit.constants';

@Throttle(PUBLIC_FORM_THROTTLE)
@Controller('public/contact-messages')
export class PublicContactMessagesController {
  constructor(private readonly contactMessages: ContactMessagesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateContactMessageDto,
  ): Promise<{ success: true }> {
    await this.contactMessages.create(dto);
    return { success: true };
  }
}
