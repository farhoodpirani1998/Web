import { IsEnum } from 'class-validator';
import { PublishStatus } from '../../../core/publishing/publish-status.enum';

export class UpdateTextbookStatusDto {
  @IsEnum(PublishStatus)
  status!: PublishStatus;
}
