import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SiteModule } from '../../core/site/site.module';
import { CmsAuthModule } from '../../identity/auth/cms-auth.module';
import { ContactMessage } from './entities/contact-message.entity';
import { ContactMessagesController } from './contact-messages.controller';
import { ContactMessagesService } from './contact-messages.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ContactMessage]),
    SiteModule,
    CmsAuthModule,
  ],
  providers: [ContactMessagesService],
  controllers: [ContactMessagesController],
  exports: [ContactMessagesService],
})
export class ContactMessagesModule {}
