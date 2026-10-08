import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { TranslatableTextDto } from '../../common/dto/translatable-text.dto';
import { MenuItemLinkType } from '../entities/menu-item-link-type.enum';

// menuId is deliberately not editable here — moving an item to a
// different menu is not supported; delete and recreate it there
// instead, same idiom as this codebase not allowing a Page to change
// siteId post-creation.
export class UpdateMenuItemDto {
  // Explicit null moves the item back to top-level; undefined leaves
  // it unchanged — same convention as StaticPage.parentId.
  @IsOptional()
  @IsUUID()
  parentId?: string | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableTextDto)
  label?: TranslatableTextDto;

  @IsOptional()
  @IsEnum(MenuItemLinkType)
  linkType?: MenuItemLinkType;

  // Explicit null clears it; undefined leaves it unchanged.
  @IsOptional()
  @IsUUID()
  pageId?: string | null;

  @IsOptional()
  @IsString()
  @MinLength(1)
  url?: string | null;

  @IsOptional()
  @IsBoolean()
  visible?: boolean;
}
