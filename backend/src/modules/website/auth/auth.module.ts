import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebsiteRoleAssignment } from './entities/website-role-assignment.entity';
import { WebsiteAuthGuard } from './website-auth.guard';
import { WebsitePermissionGuard } from './website-permission.guard';
import { WebsiteSuperAdminGuard } from './website-super-admin.guard';
import { RoleAssignmentsService } from './role-assignments.service';
import { RoleAssignmentsController } from './role-assignments.controller';

@Module({
  imports: [JwtModule.register({}), TypeOrmModule.forFeature([WebsiteRoleAssignment])],
  controllers: [RoleAssignmentsController],
  providers: [
    WebsiteAuthGuard,
    WebsitePermissionGuard,
    WebsiteSuperAdminGuard,
    RoleAssignmentsService,
  ],
  exports: [WebsiteAuthGuard, WebsitePermissionGuard, JwtModule, TypeOrmModule],
})
export class WebsiteAuthModule {}
