import { PartialType } from '@nestjs/mapped-types';
import { CreateEmpAttendanceDto } from './create.dto';

export class UpdateEmpAttendanceDto extends PartialType(CreateEmpAttendanceDto) {}
