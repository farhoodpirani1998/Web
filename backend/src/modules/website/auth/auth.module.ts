import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebsiteRoleAssignment } from './entities/website-role-assignment.entity';
import { WebsiteAuthGuard } from './website-auth.guard';
import { WebsitePermissionGuard } from './website-permission.guard';

@Module({
  imports: [JwtModule.register({}), TypeOrmModule.forFeature([WebsiteRoleAssignment])],
  providers: [WebsiteAuthGuard, WebsitePermissionGuard],
  exports: [WebsiteAuthGuard, WebsitePermissionGuard, JwtModule, TypeOrmModule],
})
export class WebsiteAuthModule {}
