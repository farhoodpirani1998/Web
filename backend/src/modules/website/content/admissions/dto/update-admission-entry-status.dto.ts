import { IsEnum } from 'class-validator';
import { PublishStatus } from '../../../core/publishing/publish-status.enum';

export class UpdateAdmissionEntryStatusDto {
  @IsEnum(PublishStatus)
  status!: PublishStatus;
}
