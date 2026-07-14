import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Menu } from '../../content/navigation/entities/menu.entity';
import { MenuItem } from '../../content/navigation/entities/menu-item.entity';
import { MenuItemLinkType } from '../../content/navigation/entities/menu-item-link-type.enum';
import { StaticPage } from '../../content/pages/entities/page.entity';
import { SiteService } from '../../core/site/site.service';
import { PublicVisibilityService } from '../common/public-visibility.service';

interface PublicMenuItemNode {
  id: string;
  label: MenuItem['label'];
  linkType: MenuItemLinkType;
  href: string | null;
  position: number;
  children: PublicMenuItemNode[];
}

/**
 * Public read for one named menu (e.g. "header", "footer"), resolved
 * into a nested tree with `href` already computed — the frontend never
 * needs to know about pageId/StaticPage lookups, only render links.
 *
 * A PAGE-linked item whose target page isn't currently published is
 * silently dropped rather than shown as a dead link — same "withhold
 * rather than 404" posture PagesService/NewsService already apply via
 * their sitemap providers.
 */
@Controller('public/navigation')
export class PublicNavigationController {
  constructor(
    @InjectRepository(Menu)
    private readonly menuRepo: Repository<Menu>,
    @InjectRepository(MenuItem)
    private readonly menuItemRepo: Repository<MenuItem>,
    @InjectRepository(StaticPage)
    private readonly pagesRepo: Repository<StaticPage>,
    private readonly siteService: SiteService,
    private readonly visibility: PublicVisibilityService,
  ) {}

  @Get(':key')
  async getByKey(@Param('key') key: string): Promise<PublicMenuItemNode[]> {
    const siteId = this.siteService.getDefaultSiteId();
    const menu = await this.menuRepo.findOne({ where: { siteId, key } });
    if (!menu) {
      throw new NotFoundException(`Menu "${key}" not found`);
    }

    const items = await this.menuItemRepo.find({
      where: { menuId: menu.id, visible: true },
      order: { position: 'ASC' },
    });

    const pageIds = [
      ...new Set(
        items.map((item) => item.pageId).filter((id): id is string => !!id),
      ),
    ];
    const pages = pageIds.length
      ? await this.pagesRepo.find({ where: { id: In(pageIds) } })
      : [];
    const pageMap = new Map(pages.map((page) => [page.id, page]));

    const resolvable = items.filter((item) => {
      if (item.linkType !== MenuItemLinkType.PAGE) return true;
      const page = item.pageId ? pageMap.get(item.pageId) : undefined;
      return !!page && this.visibility.isVisible(page);
    });

    return this.buildTree(resolvable, undefined, pageMap);
  }

  private buildTree(
    items: MenuItem[],
    parentId: string | undefined,
    pageMap: Map<string, StaticPage>,
  ): PublicMenuItemNode[] {
    return items
      .filter((item) => item.parentId === parentId)
      .map((item) => ({
        id: item.id,
        label: item.label,
        linkType: item.linkType,
        href: this.resolveHref(item, pageMap),
        position: item.position,
        children: this.buildTree(items, item.id, pageMap),
      }));
  }

  private resolveHref(
    item: MenuItem,
    pageMap: Map<string, StaticPage>,
  ): string | null {
    if (item.linkType === MenuItemLinkType.EXTERNAL) return item.url ?? null;
    const page = item.pageId ? pageMap.get(item.pageId) : undefined;
    if (!page) return null;
    return page.isHomepage ? '/' : `/${page.slug}`;
  }
}
