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

  async create(dto: CreateTaskWorkItemDto) {
    // Validate existence of related entities
    const { task, employee, task_status } = dto;
    const errors = [];

    if (task !== undefined) {
      const taskExists = await this.repo.manager.findOne('tasks', { where: { id: task } });
      if (!taskExists) errors.push('task id does not exist');
    }
    if (employee !== undefined) {
      const employeeExists = await this.repo.manager.findOne('employees', { where: { id: employee } });
      if (!employeeExists) errors.push('employee id does not exist');
    }
    if (task_status !== undefined) {
      const statusExists = await this.repo.manager.findOne('task_statuses', { where: { id: task_status } });
      if (!statusExists) errors.push('task_status id does not exist');
    }
    if (errors.length > 0) {
      return { statusCode: 400, message: errors.join(', ') };
    }

    // Map numeric IDs to entity references for relations
    const createData: any = { ...dto };
    if (task !== undefined) {
      createData.task = { id: task };
    }
    if (employee !== undefined) {
      createData.employee = { id: employee };
    }
    if (task_status !== undefined) {
      createData.task_status = { id: task_status };
    }
    try {
      return await this.repo.save(createData);
    } catch (error) {
      const errMsg = (error instanceof Error) ? error.message : 'Internal server error';
      return { statusCode: 500, message: errMsg };
    }
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
