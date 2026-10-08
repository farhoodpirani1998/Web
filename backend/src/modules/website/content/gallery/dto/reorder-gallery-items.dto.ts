import { ArrayNotEmpty, IsUUID } from 'class-validator';

export class ReorderGalleryItemsDto {
  // Full ordered array of GalleryItem ids for this site, produced by a
  // drag-and-drop admin UI — handed straight to OrderingService.reorder.
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  orderedIds!: string[];
}
