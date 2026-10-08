import { ArrayNotEmpty, IsUUID } from 'class-validator';

export class ReorderHeroSlidesDto {
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  orderedIds!: string[];
}
