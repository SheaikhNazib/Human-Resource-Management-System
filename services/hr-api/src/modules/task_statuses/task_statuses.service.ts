import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskStatuses } from '../../models/task_statuses.entity';
import { CreateTaskStatusDto } from './dto/create.dto';
import { UpdateTaskStatusDto } from './dto/update.dto';

@Injectable()
export class TaskStatusesService {
  constructor(
    @InjectRepository(TaskStatuses)
    private readonly repo: Repository<TaskStatuses>,
  ) {}

  async create(createDto: CreateTaskStatusDto) {
    const status = this.repo.create(createDto);
    return this.repo.save(status);
  }

  async findAll() {
    const data = await this.repo.find();
    return {
      message: data.length ? 'Task statuses fetched successfully.' : 'No task statuses found.',
      data,
    };
  }

  async findOne(id: number) {
    const data = await this.repo.findOneBy({ id });
    if (data) {
      return {
        message: 'Task status fetched successfully.',
        data,
      };
    } else {
      return {
        message: 'Task status not found.',
        data: null,
      };
    }
  }

  async update(id: number, updateDto: UpdateTaskStatusDto) {
    const result = await this.repo.update(id, updateDto);
    if (result.affected && result.affected > 0) {
      const updated = await this.repo.findOneBy({ id });
      return {
        message: 'Task status updated successfully.',
        data: updated,
      };
    } else {
      return {
        message: 'Task status not found or not updated.',
        data: null,
      };
    }
  }

  async remove(id: number) {
    const result = await this.repo.delete(id);
    if (result.affected && result.affected > 0) {
      return {
        message: 'Task status deleted successfully.',
        id,
        status: 'success',
      };
    } else {
      return {
        message: 'Task status not found.',
        id,
        status: 'not_found',
      };
    }
  }
}
