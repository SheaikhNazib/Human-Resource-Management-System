import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import { AppRolesService } from "./app_roles.service";
import { CreateAppRoleDto } from "./dto/create.dto";
import { UpdateAppRoleDto } from "./dto/update.dto";

@Controller("app-roles")
export class AppRolesController {
  constructor(private readonly appRolesService: AppRolesService) {}

  @Post()
  create(@Body() createAppRoleDto: CreateAppRoleDto) {
    return this.appRolesService.create(createAppRoleDto);
  }

  @Get()
  findAll() {
    return this.appRolesService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.appRolesService.findOne(+id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateAppRoleDto: UpdateAppRoleDto) {
    return this.appRolesService.update(+id, updateAppRoleDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.appRolesService.remove(+id);
  }
}
