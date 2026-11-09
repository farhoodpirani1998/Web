import { IsEnum } from 'class-validator';
import { ContactMessageStatus } from '../entities/contact-message-status.enum';

export class UpdateContactMessageStatusDto {
  @IsEnum(ContactMessageStatus)
  status!: ContactMessageStatus;
}
