import { ArrayNotEmpty, IsUUID } from 'class-validator';

export class ReorderTeachersDto {
  // Full ordered array of Teacher ids for this site, produced by a
  // drag-and-drop admin UI — handed straight to OrderingService.reorder.
  // Same shape as ReorderCampusesDto.
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  orderedIds!: string[];
}
