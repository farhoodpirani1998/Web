import { ArrayNotEmpty, IsUUID } from 'class-validator';

export class ReorderAdmissionEntriesDto {
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  orderedIds!: string[];
}
