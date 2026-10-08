import { ArrayNotEmpty, IsUUID } from 'class-validator';

export class ReorderTestimonialsDto {
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  orderedIds!: string[];
}
