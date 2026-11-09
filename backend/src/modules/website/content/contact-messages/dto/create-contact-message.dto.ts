import {
  IsEnum,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ContactMessageSubject } from '../entities/contact-message-subject.enum';

export class CreateContactMessageDto {
  @IsString()
  @Matches(/\S/)
  @MaxLength(150)
  fullName!: string;

  @IsString()
  @Matches(/^0\d{10}$/)
  phone!: string;

  @IsEnum(ContactMessageSubject)
  subject!: ContactMessageSubject;

  @IsString()
  @Matches(/\S/)
  @MinLength(1)
  @MaxLength(5000)
  message!: string;
}
