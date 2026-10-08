import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Menu } from './entities/menu.entity';
import { MenuItem } from './entities/menu-item.entity';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { SiteService } from '../../core/site/site.service';
import { RedisService } from '../../core/redis/redis.service';
import { buildPublicCacheKey } from '../../public-api/common/public-cache.constants';

@Injectable()
export class MenusService {
  constructor(
    @InjectRepository(Menu)
    private readonly menuRepo: Repository<Menu>,
    @InjectRepository(MenuItem)
    private readonly menuItemRepo: Repository<MenuItem>,
    private readonly siteService: SiteService,
    private readonly redis: RedisService,
  ) {}

  private async assertKeyAvailable(
    siteId: string,
    key: string,
    excludingId?: string,
  ): Promise<void> {
    const existing = await this.menuRepo.findOne({ where: { siteId, key } });
    if (existing && existing.id !== excludingId) {
      throw new ConflictException(`Menu key "${key}" is already in use`);
    }
  }

  async create(dto: CreateMenuDto): Promise<Menu> {
    const siteId = this.siteService.getDefaultSiteId();
    await this.assertKeyAvailable(siteId, dto.key);
    const menu = await this.menuRepo.save(
      this.menuRepo.create({ siteId, key: dto.key, name: dto.name }),
    );
    await this.redis.delete(buildPublicCacheKey('navigation', menu.key));
    return menu;
  }

  async findAll(): Promise<Menu[]> {
    const siteId = this.siteService.getDefaultSiteId();
    return this.menuRepo.find({ where: { siteId }, order: { createdAt: 'ASC' } });
  }

  async findOne(id: string): Promise<Menu> {
    return this.menuRepo.findOneByOrFail({ id });
  }

  async update(id: string, dto: UpdateMenuDto): Promise<Menu> {
    const menu = await this.findOne(id);
    const previousKey = menu.key;
    if (dto.key !== undefined && dto.key !== menu.key) {
      await this.assertKeyAvailable(menu.siteId, dto.key, menu.id);
      menu.key = dto.key;
    }
    if (dto.name !== undefined) menu.name = dto.name;
    const saved = await this.menuRepo.save(menu);

    await this.redis.delete(buildPublicCacheKey('navigation', previousKey));
    if (saved.key !== previousKey) {
      await this.redis.delete(buildPublicCacheKey('navigation', saved.key));
    }
    return saved;
  }

  /**
   * Deleting a Menu deletes its MenuItem rows too — unlike StaticPage's
   * parent/child hierarchy (a peer relationship, where deletion is
   * rejected until children are moved or removed explicitly), a Menu
   * is a composition root for its items: an item cannot exist without
   * its menu, so there is nothing to orphan or reparent. Done in one
   * transaction so a failure can't leave items pointing at a deleted
   * menu.
   */
  async remove(id: string): Promise<void> {
    const menu = await this.findOne(id);
    await this.menuRepo.manager.transaction(async (trx) => {
      await trx.delete(MenuItem, { menuId: menu.id });
      await trx.delete(Menu, { id: menu.id });
    });
    await this.redis.delete(buildPublicCacheKey('navigation', menu.key));
  }
}
