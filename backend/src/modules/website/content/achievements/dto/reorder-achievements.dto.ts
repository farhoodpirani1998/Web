import { ArrayNotEmpty, IsUUID } from 'class-validator';

export class ReorderAchievementsDto {
  // Full ordered array of achievement ids for this site, produced by a
  // drag-and-drop admin UI — handed straight to OrderingService.reorder.
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  orderedIds!: string[];
}
