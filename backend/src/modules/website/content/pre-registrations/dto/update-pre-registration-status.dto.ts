import { IsEnum } from 'class-validator';
import { PreRegistrationStatus } from '../entities/pre-registration-status.enum';

export class UpdatePreRegistrationStatusDto {
  @IsEnum(PreRegistrationStatus)
  status!: PreRegistrationStatus;
}
