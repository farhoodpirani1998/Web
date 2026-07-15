import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Menu } from './entities/menu.entity';
import { MenuItem } from './entities/menu-item.entity';
import { MenusService } from './menus.service';
import { MenuItemsService } from './menu-items.service';
import { MenusController } from './menus.controller';
import { MenuItemsController } from './menu-items.controller';
import { SiteModule } from '../../core/site/site.module';
import { OrderingModule } from '../../core/ordering/ordering.module';
import { WebsiteAuthModule } from '../../auth/auth.module';
import { PagesModule } from '../pages/pages.module';

/**
 * Imports only the kernel pieces it actually uses: site scoping,
 * ordering (per-parent drag-and-drop position, same OrderingService as
 * Feature/Faq/Testimonial), and auth (permission-gated admin routes).
 * No publishing/revisions — menus are structural/list content, same
 * bucket as Feature/Faq/Testimonial (see the entities' own comments).
 * No media — menu items don't reference images.
 *
 * Also imports PagesModule to reuse PagesService for validating a
 * MenuItem's `pageId` (exists, same site) rather than duplicating that
 * lookup here — same cross-module reuse idiom as content modules
 * importing MediaModule for their own featured-image references.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Menu, MenuItem]),
    SiteModule,
    OrderingModule,
    WebsiteAuthModule,
    PagesModule,
  ],
  providers: [MenusService, MenuItemsService],
  controllers: [MenusController, MenuItemsController],
  exports: [MenusService, MenuItemsService],
})
export class NavigationModule {}
