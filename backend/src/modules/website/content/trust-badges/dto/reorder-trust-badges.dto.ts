import { ArrayNotEmpty, IsUUID } from 'class-validator';

export class ReorderTrustBadgesDto {
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  orderedIds!: string[];
}
