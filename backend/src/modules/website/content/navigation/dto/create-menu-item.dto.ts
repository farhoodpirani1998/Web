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

export class CreateMenuItemDto {
  @IsUUID()
  menuId!: string;

  // Omit for a top-level item. Re-validated (exists, same menu, no
  // cycle) in MenuItemsService — see assertValidParent.
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ValidateNested()
  @Type(() => TranslatableTextDto)
  label!: TranslatableTextDto;

  @IsEnum(MenuItemLinkType)
  linkType!: MenuItemLinkType;

  // Exactly one of pageId/url must be set, matching linkType — checked
  // in MenuItemsService rather than here, same as this codebase's other
  // cross-field invariants (e.g. PagesService.assertValidParent).
  @IsOptional()
  @IsUUID()
  pageId?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  url?: string;

  @IsOptional()
  @IsBoolean()
  visible?: boolean;
}
