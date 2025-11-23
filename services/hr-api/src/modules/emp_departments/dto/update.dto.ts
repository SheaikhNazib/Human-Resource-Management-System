import { PartialType } from '@nestjs/swagger';
import { CreateEmpDepartmentDto } from './create.dto';

export class UpdateEmpDepartmentDto extends PartialType(CreateEmpDepartmentDto) {}
