import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskWorkItems } from '../../models/task_work_items.entity';
import { CreateTaskWorkItemDto } from './dto/create.dto';
import { UpdateTaskWorkItemDto } from './dto/update.dto';

@Injectable()
export class TaskWorkItemsService {
  constructor(
    @InjectRepository(TaskWorkItems)
    private readonly repo: Repository<TaskWorkItems>,
  ) {}

  create(dto: CreateTaskWorkItemDto) {
    // Map numeric IDs to entity references for relations
    const createData: any = { ...dto };
    if (dto.task !== undefined) {
      createData.task = { id: dto.task };
    }
    if (dto.employee !== undefined) {
      createData.employee = { id: dto.employee };
    }
    if (dto.task_status !== undefined) {
      createData.task_status = { id: dto.task_status };
    }
    return this.repo.save(createData);
  }

  findAll() {
    return this.repo.find({ relations: ['task', 'employee', 'task_status'] });
  }

  findOne(id: number) {
    return this.repo.findOne({ where: { id }, relations: ['task', 'employee', 'task_status'] });
  }

  update(id: number, dto: UpdateTaskWorkItemDto) {
    // Map numeric IDs to entity references for relations
    const updateData: any = { ...dto };
    if (dto.task !== undefined) {
      updateData.task = { id: dto.task };
    }
    if (dto.employee !== undefined) {
      updateData.employee = { id: dto.employee };
    }
    if (dto.task_status !== undefined) {
      updateData.task_status = { id: dto.task_status };
    }
    return this.repo.update(id, updateData);
  }

  remove(id: number) {
    return this.repo.delete(id);
  }
}
