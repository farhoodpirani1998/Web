import { ArrayNotEmpty, IsUUID } from 'class-validator';

export class ReorderPortalLinksDto {
  // Full ordered array of PortalLink ids for this site, produced by a
  // drag-and-drop admin UI — handed straight to OrderingService.reorder,
  // same idiom as ReorderFeaturesDto (flat, table-wide, unlike
  // ReorderMenuItemsDto which is scoped per parent).
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  orderedIds!: string[];
}
