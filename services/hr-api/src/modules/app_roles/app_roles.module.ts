import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppRoles } from "../../models/app_roles.entity";
import { AppRolesController } from "./app_roles.controller";
import { AppRolesService } from "./app_roles.service";

@Module({
  imports: [TypeOrmModule.forFeature([AppRoles])],
  controllers: [AppRolesController],
  providers: [AppRolesService],
  exports: [AppRolesService],
})
export class AppRolesModule {}
