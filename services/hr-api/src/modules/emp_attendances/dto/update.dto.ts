import { PartialType } from '@nestjs/swagger';
import { CreateEmpAttendanceDto } from './create.dto';

export class UpdateEmpAttendanceDto extends PartialType(CreateEmpAttendanceDto) {}
