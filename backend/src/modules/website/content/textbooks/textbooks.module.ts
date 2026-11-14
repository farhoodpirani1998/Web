import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SiteModule } from '../../core/site/site.module';
import { CmsAuthModule } from '../../identity/auth/cms-auth.module';
import { TextbookAuditLog } from './entities/textbook-audit-log.entity';
import { TextbookDownloadLog } from './entities/textbook-download-log.entity';
import { TextbookFileCleanup } from './entities/textbook-file-cleanup.entity';
import { Textbook } from './entities/textbook.entity';
import { TextbookTaxonomy } from './entities/textbook-taxonomy.entity';
import {
  LocalTextbookStorageService,
  localTextbookStorageProvider,
} from './local-textbook-storage.service';
import { TextbookFileCleanupService } from './textbook-file-cleanup.service';
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
      TextbookFileCleanup,
    ]),
    SiteModule,
    CmsAuthModule,
  ],
  controllers: [
    TextbooksController,
    TextbookTaxonomiesController,
    PublicTextbooksController,
  ],
  providers: [
    TextbooksService,
    TextbookFileCleanupService,
    LocalTextbookStorageService,
    localTextbookStorageProvider,
  ],
  exports: [TextbooksService],
})
export class TextbooksModule {}
