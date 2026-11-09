import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class UpdatePreRegistrationAssignmentDto {
  @IsOptional()
  @IsUUID()
  assignedAdminId?: string | null;

  @IsOptional()
  @IsDateString()
  followUpAt?: string | null;
}
