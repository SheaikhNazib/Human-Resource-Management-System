import { PartialType } from '@nestjs/swagger';
import { CreateEmpSalaryCompensationDto } from './create.dto';

export class UpdateEmpSalaryCompensationDto extends PartialType(CreateEmpSalaryCompensationDto) {}
