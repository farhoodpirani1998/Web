import { Entity, Column, Index } from 'typeorm';
import { BaseSiteScopedEntity } from '../../../core/common/base-site-scoped.entity';
import { Translatable } from '../../../core/i18n/locale.enum';
import { MenuItemLinkType } from './menu-item-link-type.enum';

/**
 * A single clickable entry in a Menu. Entries form a tree (top-level
 * items plus nested dropdown/flyout children) via `parentId`, and are
 * manually ordered among their siblings via `position` — same
 * `OrderingService`-backed idiom as Feature/Testimonial/Faq, just
 * scoped to (menuId, parentId) instead of the whole table.
 *
 * `menuId` and `parentId` are plain uuid references, not TypeORM
 * relations/FKs — consistent with this codebase's convention of loose,
 * service-validated references (see StaticPage.parentId) rather than
 * relational cascades. Existence, same-menu, and no-cycle checks live
 * in MenuItemsService.
 *
 * Not one of the 4 revision-enabled types — a nav entry is trivial to
 * retype, same reasoning as Feature/Faq/Testimonial.
 */
@Entity('menu_items')
export class MenuItem extends BaseSiteScopedEntity {
  @Index()
  @Column({ type: 'uuid' })
  menuId!: string;

  // Nullable — most items are top-level. A non-null value must
  // reference another MenuItem in the SAME menu (enforced in
  // MenuItemsService, not at the DB layer) — same shape as
  // StaticPage.parentId.
  @Index()
  @Column({ type: 'uuid', nullable: true })
  parentId?: string;

  @Column({ type: 'jsonb' })
  label!: Translatable<string>;

  @Column({ type: 'enum', enum: MenuItemLinkType })
  linkType!: MenuItemLinkType;

  // Set when linkType = PAGE; a loose reference into StaticPage,
  // validated in MenuItemsService (exists, same site). Never both this
  // and `url` populated at once — enforced in the service, mirroring
  // how this codebase validates cross-field invariants elsewhere
  // (e.g. PagesService.assertValidParent) rather than at the DB layer.
  @Column({ type: 'uuid', nullable: true })
  pageId?: string;

  // Set when linkType = EXTERNAL. Plain string, not @IsUrl at the DTO
  // layer would be too strict for e.g. mailto:/tel: links — validated
  // as a non-empty string only, same reasoning as HeroSlide.ctaUrl.
  @Column({ nullable: true })
  url?: string;

  // Ordering among siblings sharing the same (menuId, parentId) —
  // MenuItemsService.reorder scopes the OrderingService call to one
  // parent's children at a time, same mechanism as Feature/Faq, just
  // partitioned rather than table-wide.
  @Index()
  @Column({ type: 'int', default: 0 })
  position!: number;

  // Whether this entry renders in the live navigation. Independent of
  // the linked page's own publish status — same relationship as
  // StaticPage.showInMenu, just inverted (the flag lives on the menu
  // entry here rather than on the page, since a page can appear in
  // more than one menu).
  @Column({ default: true })
  visible!: boolean;
}
