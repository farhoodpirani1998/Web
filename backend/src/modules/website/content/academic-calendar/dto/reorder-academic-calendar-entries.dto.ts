import { ArrayNotEmpty, IsUUID } from 'class-validator';

export class ReorderAcademicCalendarEntriesDto {
  // Full ordered array of entry ids for this site — handed straight to
  // OrderingService.reorder. Callers must pass every id (the ordering is
  // global across kinds, since the list route returns all kinds and the
  // admin reorders within one kind filter).
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  orderedIds!: string[];
}
