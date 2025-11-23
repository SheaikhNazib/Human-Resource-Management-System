import { PartialType } from '@nestjs/swagger';
import { CreateEmployeeDto } from './create.dto';

export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {}
