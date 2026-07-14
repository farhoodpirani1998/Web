import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Media } from './entities/media.entity';
import { MediaUsage } from './entities/media-usage.entity';
import { MediaService } from './media.service';
import { SiteModule } from '../site/site.module';
import { EventsModule } from '../events/events.module';
import { STORAGE_PROVIDER } from './storage/storage.interface';
import { LocalStorageProvider } from './storage/local-storage.provider';
import { S3CompatibleStorageProvider } from './storage/s3-compatible-storage.provider';

// Exactly two implementations, selected by configuration — no
// provider-discovery mechanism, no plugin system.
const storageProviderFactory = {
  provide: STORAGE_PROVIDER,
  useFactory: (config: ConfigService) => {
    const driver = config.get<string>('STORAGE_DRIVER', 'local');
    return driver === 's3'
      ? new S3CompatibleStorageProvider(config)
      : new LocalStorageProvider(config);
  },
  inject: [ConfigService],
};

@Module({
  imports: [TypeOrmModule.forFeature([Media, MediaUsage]), SiteModule, EventsModule],
  providers: [MediaService, storageProviderFactory],
  exports: [MediaService],
})
export class MediaModule {}
