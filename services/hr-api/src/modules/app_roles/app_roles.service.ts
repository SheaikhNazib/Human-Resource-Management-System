import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AppRoles } from "../../models/app_roles.entity";
import { CreateAppRoleDto } from "./dto/create.dto";
import { UpdateAppRoleDto } from "./dto/update.dto";

@Injectable()
export class AppRolesService {
  constructor(
    @InjectRepository(AppRoles)
    private readonly appRolesRepository: Repository<AppRoles>
  ) {}

  async create(createAppRoleDto: CreateAppRoleDto): Promise<AppRoles> {
    const appRole = this.appRolesRepository.create(createAppRoleDto);
    return this.appRolesRepository.save(appRole);
  }

  async findAll(): Promise<AppRoles[]> {
    return this.appRolesRepository.find();
  }

  async findOne(id: number): Promise<AppRoles | null> {
    return this.appRolesRepository.findOneBy({ id });
  }

  async update(
    id: number,
    updateAppRoleDto: UpdateAppRoleDto
  ): Promise<AppRoles | null> {
    await this.appRolesRepository.update(id, updateAppRoleDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.appRolesRepository.delete(id);
  }
}
