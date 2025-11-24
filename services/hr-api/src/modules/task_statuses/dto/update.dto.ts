import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskStatusDto } from './create.dto';

export class UpdateTaskStatusDto extends PartialType(CreateTaskStatusDto) {}
