import { ArrayNotEmpty, IsUUID } from 'class-validator';

export class ReorderCampusesDto {
  // Full ordered array of Campus ids for this site, produced by a
  // drag-and-drop admin UI — handed straight to OrderingService.reorder.
  // Same shape as ReorderFeaturesDto.
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  orderedIds!: string[];
}
