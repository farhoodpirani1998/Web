import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuItem } from './entities/menu-item.entity';
import { MenuItemLinkType } from './entities/menu-item-link-type.enum';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { SiteService } from '../../core/site/site.service';
import { OrderingService } from '../../core/ordering/ordering.service';
import { MenusService } from './menus.service';
import { PagesService } from '../pages/pages.service';

// Same safety net (and same reasoning) as PagesService.MAX_ANCESTOR_WALK
// — real menu trees are shallow, this is never expected to matter.
const MAX_ANCESTOR_WALK = 1000;

@Injectable()
export class MenuItemsService {
  constructor(
    @InjectRepository(MenuItem)
    private readonly menuItemRepo: Repository<MenuItem>,
    private readonly siteService: SiteService,
    private readonly ordering: OrderingService,
    private readonly menusService: MenusService,
    private readonly pagesService: PagesService,
  ) {}

  private async assertValidMenu(siteId: string, menuId: string): Promise<void> {
    const menu = await this.menusService.findOne(menuId).catch(() => undefined);
    if (!menu || menu.siteId !== siteId) {
      throw new BadRequestException('menuId does not reference an existing menu');
    }
  }

  private async assertValidPage(siteId: string, pageId: string): Promise<void> {
    const page = await this.pagesService.findOne(pageId).catch(() => undefined);
    if (!page || page.siteId !== siteId) {
      throw new BadRequestException('pageId does not reference an existing page');
    }
  }

  /**
   * Exactly one of pageId/url, matching linkType — a cross-field
   * invariant checked here rather than at the DTO layer, same as
   * PagesService.assertValidParent handling parentId's invariants.
   */
  private assertValidLink(
    linkType: MenuItemLinkType,
    pageId: string | undefined,
    url: string | undefined,
  ): void {
    if (linkType === MenuItemLinkType.PAGE) {
      if (!pageId) {
        throw new BadRequestException('pageId is required when linkType is "page"');
      }
      if (url) {
        throw new BadRequestException('url must not be set when linkType is "page"');
      }
    } else {
      if (!url) {
        throw new BadRequestException('url is required when linkType is "external"');
      }
      if (pageId) {
        throw new BadRequestException('pageId must not be set when linkType is "external"');
      }
    }
  }

  /**
   * Confirms `parentId` names an existing item in the SAME menu, and
   * (when updating an existing item, i.e. `itemId` is set) that
   * adopting it would not create a cycle — identical shape to
   * PagesService.assertValidParent, just also menu-scoped.
   */
  private async assertValidParent(
    siteId: string,
    menuId: string,
    itemId: string | undefined,
    parentId: string,
  ): Promise<void> {
    const parent = await this.menuItemRepo.findOne({
      where: { id: parentId, siteId, menuId },
    });
    if (!parent) {
      throw new BadRequestException(
        'parentId does not reference an existing item in the same menu',
      );
    }
    if (!itemId) return;

    let currentId: string | undefined = parent.id;
    let steps = 0;
    while (currentId) {
      if (currentId === itemId) {
        throw new BadRequestException('parentId would create a circular menu hierarchy');
      }
      if (++steps > MAX_ANCESTOR_WALK) break;
      const current = await this.menuItemRepo.findOne({
        where: { id: currentId, siteId, menuId },
      });
      currentId = current?.parentId;
    }
  }

  async create(dto: CreateMenuItemDto): Promise<MenuItem> {
    const siteId = this.siteService.getDefaultSiteId();
    await this.assertValidMenu(siteId, dto.menuId);
    this.assertValidLink(dto.linkType, dto.pageId, dto.url);
    if (dto.linkType === MenuItemLinkType.PAGE && dto.pageId) {
      await this.assertValidPage(siteId, dto.pageId);
    }
    if (dto.parentId) {
      await this.assertValidParent(siteId, dto.menuId, undefined, dto.parentId);
    }

    const maxPosition = await this.menuItemRepo
      .createQueryBuilder('item')
      .select('MAX(item.position)', 'max')
      .where('item.menuId = :menuId', { menuId: dto.menuId })
      .andWhere(
        dto.parentId ? 'item.parentId = :parentId' : 'item.parentId IS NULL',
        dto.parentId ? { parentId: dto.parentId } : {},
      )
      .getRawOne<{ max: number | null }>();

    return this.menuItemRepo.save(
      this.menuItemRepo.create({
        siteId,
        menuId: dto.menuId,
        parentId: dto.parentId,
        label: dto.label,
        linkType: dto.linkType,
        pageId: dto.linkType === MenuItemLinkType.PAGE ? dto.pageId : undefined,
        url: dto.linkType === MenuItemLinkType.EXTERNAL ? dto.url : undefined,
        position: (maxPosition?.max ?? -1) + 1,
        visible: dto.visible ?? true,
      }),
    );
  }

  /**
   * Flat list, same convention as PagesService.findAll — the admin UI
   * assembles the tree client-side from `parentId`. `parentId` filters
   * to one level (e.g. "just this dropdown's children") when provided.
   */
  async findAll(menuId: string, parentId?: string): Promise<MenuItem[]> {
    const qb = this.menuItemRepo
      .createQueryBuilder('item')
      .where('item.menuId = :menuId', { menuId });
    if (parentId) qb.andWhere('item.parentId = :parentId', { parentId });
    return qb.addOrderBy('item.position', 'ASC').getMany();
  }

  async findOne(id: string): Promise<MenuItem> {
    return this.menuItemRepo.findOneByOrFail({ id });
  }

  async update(id: string, dto: UpdateMenuItemDto): Promise<MenuItem> {
    const item = await this.findOne(id);

    const nextLinkType = dto.linkType ?? item.linkType;
    const nextPageId = dto.pageId === undefined ? item.pageId : dto.pageId ?? undefined;
    const nextUrl = dto.url === undefined ? item.url : dto.url ?? undefined;
    this.assertValidLink(nextLinkType, nextPageId, nextUrl);
    if (
      nextLinkType === MenuItemLinkType.PAGE &&
      nextPageId &&
      (dto.pageId !== undefined || dto.linkType !== undefined)
    ) {
      await this.assertValidPage(item.siteId, nextPageId);
    }

    if (dto.parentId !== undefined) {
      if (dto.parentId === null) {
        item.parentId = undefined;
      } else {
        await this.assertValidParent(item.siteId, item.menuId, item.id, dto.parentId);
        item.parentId = dto.parentId;
      }
    }

    if (dto.label !== undefined) item.label = dto.label;
    item.linkType = nextLinkType;
    item.pageId = nextPageId;
    item.url = nextUrl;
    if (dto.visible !== undefined) item.visible = dto.visible;

    return this.menuItemRepo.save(item);
  }

  /**
   * Same guard idiom as PagesService.remove: reject rather than
   * silently orphaning children. The caller re-parents or deletes the
   * children first.
   */
  async remove(id: string): Promise<void> {
    const item = await this.findOne(id);
    const childCount = await this.menuItemRepo.count({ where: { parentId: item.id } });
    if (childCount > 0) {
      throw new ConflictException(
        'Cannot delete a menu item that has child items — move or delete them first',
      );
    }
    await this.menuItemRepo.delete({ id });
  }

  /**
   * Reorders one parent's children at a time (see ReorderMenuItemsDto).
   * `orderedIds` must be exactly the current sibling set — partial or
   * cross-parent/cross-menu lists are rejected, since OrderingService
   * itself trusts the caller and writes whatever ids it's given.
   */
  async reorder(
    menuId: string,
    parentId: string | null | undefined,
    orderedIds: string[],
  ): Promise<void> {
    const qb = this.menuItemRepo
      .createQueryBuilder('item')
      .where('item.menuId = :menuId', { menuId });
    if (parentId) {
      qb.andWhere('item.parentId = :parentId', { parentId });
    } else {
      qb.andWhere('item.parentId IS NULL');
    }
    const siblings = await qb.getMany();

    const siblingIds = new Set(siblings.map((sibling) => sibling.id));
    const isExactSiblingSet =
      orderedIds.length === siblings.length &&
      orderedIds.every((id) => siblingIds.has(id));
    if (!isExactSiblingSet) {
      throw new BadRequestException(
        'orderedIds must be exactly the set of sibling item ids under the given parent',
      );
    }

    await this.ordering.reorder(this.menuItemRepo.manager, 'menu_items', orderedIds);
  }
}
