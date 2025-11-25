import { PartialType } from '@nestjs/mapped-types';
import { CreateEmpPerformanceDto } from './create.dto';

export class UpdateEmpPerformanceDto extends PartialType(CreateEmpPerformanceDto) {}
