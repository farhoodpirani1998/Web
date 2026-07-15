import { ArrayNotEmpty, IsOptional, IsUUID } from 'class-validator';

/**
 * Reorders one parent's children at a time — unlike Feature/Faq's
 * flat, table-wide reorder, MenuItem positions are scoped per
 * (menuId, parentId), so the request must name which sibling group is
 * being reordered. `parentId` omitted (or explicit null) means the
 * menu's top-level items.
 */
export class ReorderMenuItemsDto {
  @IsUUID()
  menuId!: string;

  @IsOptional()
  @IsUUID()
  parentId?: string | null;

  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  orderedIds!: string[];
}
