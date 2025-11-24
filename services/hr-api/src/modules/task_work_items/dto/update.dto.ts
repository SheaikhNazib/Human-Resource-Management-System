import { PartialType } from '@nestjs/swagger';
import { CreateTaskWorkItemDto } from './create.dto';

export class UpdateTaskWorkItemDto extends PartialType(CreateTaskWorkItemDto) {}
