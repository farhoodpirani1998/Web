import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SiteModule } from '../../core/site/site.module';
import { TextbookAuditLog } from './entities/textbook-audit-log.entity';
import { TextbookDownloadLog } from './entities/textbook-download-log.entity';
import { Textbook } from './entities/textbook.entity';
import { TextbookTaxonomy } from './entities/textbook-taxonomy.entity';
import {
  LocalTextbookStorageService,
  localTextbookStorageProvider,
} from './local-textbook-storage.service';
import {
  PublicTextbooksController,
  TextbookTaxonomiesController,
  TextbooksController,
} from './textbooks.controller';
import { TextbooksService } from './textbooks.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Textbook,
      TextbookTaxonomy,
      TextbookDownloadLog,
      TextbookAuditLog,
    ]),
    SiteModule,
  ],
  controllers: [
    TextbooksController,
    TextbookTaxonomiesController,
    PublicTextbooksController,
  ],
  providers: [
    TextbooksService,
    LocalTextbookStorageService,
    localTextbookStorageProvider,
  ],
  exports: [TextbooksService],
})
export class TextbooksModule {}
