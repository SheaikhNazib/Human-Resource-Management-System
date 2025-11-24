import { PartialType } from '@nestjs/mapped-types';
import { CreateEmpJobTitleDto } from './create.dto';

export class UpdateEmpJobTitleDto extends PartialType(CreateEmpJobTitleDto) {}
