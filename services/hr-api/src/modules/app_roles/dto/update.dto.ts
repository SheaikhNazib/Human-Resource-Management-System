import { PartialType } from '@nestjs/mapped-types';
import { CreateAppRoleDto } from './create.dto';

export class UpdateAppRoleDto extends PartialType(CreateAppRoleDto) {}
