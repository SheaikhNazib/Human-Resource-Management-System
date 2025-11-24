import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Tasks } from '../../models/tasks.entity';
import { Employees } from '../../models/employees.entity';
import { TaskStatuses } from '../../models/task_statuses.entity';
import { CreateTaskDto } from './dto/create.dto';
import { UpdateTaskDto } from './dto/update.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Tasks)
    private readonly repo: Repository<Tasks>,
    @InjectRepository(Employees)
    private readonly empRepo: Repository<Employees>,
    @InjectRepository(TaskStatuses)
    private readonly statusRepo: Repository<TaskStatuses>,
  ) {}

  async create(createDto: CreateTaskDto) {
    // Validate employees
    const employees = await this.empRepo.findBy({ id: In(createDto.assigned_employees) });
    if (employees.length !== createDto.assigned_employees.length) {
      return {
        statusCode: 400,
        message: 'One or more assigned employees do not exist.',
        error: 'Bad Request',
      };
    }
    // Validate task_status
    const status = await this.statusRepo.findOneBy({ id: createDto.task_status });
    if (!status) {
      return {
        statusCode: 400,
        message: `task_status with id ${createDto.task_status} does not exist`,
        error: 'Bad Request',
      };
    }
    const task = this.repo.create({ ...createDto, assigned_employees: employees, task_status: status });
    return this.repo.save(task);
  }

  async findAll() {
    const data = await this.repo.find({ relations: ['assigned_employees', 'task_status'] });
    return {
      message: data.length ? 'Tasks fetched successfully.' : 'No tasks found.',
      data,
    };
  }

  async findOne(id: number) {
    const data = await this.repo.findOne({ where: { id }, relations: ['assigned_employees', 'task_status'] });
    if (data) {
      return {
        message: 'Task fetched successfully.',
        data,
      };
    } else {
      return {
        message: 'Task not found.',
        data: null,
      };
    }
  }

  async update(id: number, updateDto: UpdateTaskDto) {
    let employees;
    if (updateDto.assigned_employees) {
      employees = await this.empRepo.findBy({ id: In(updateDto.assigned_employees) });
      if (employees.length !== updateDto.assigned_employees.length) {
        return {
          message: 'One or more assigned employees do not exist.',
          data: null,
        };
      }
    }
    let status;
    if (updateDto.task_status) {
      status = await this.statusRepo.findOneBy({ id: updateDto.task_status });
      if (!status) {
        return {
          message: `task_status with id ${updateDto.task_status} does not exist`,
          data: null,
        };
      }
    }
    const updateData: any = { ...updateDto };
    if (employees) updateData.assigned_employees = employees;
    if (status) updateData.task_status = status;
    const result = await this.repo.update(id, updateData);
    if (result.affected && result.affected > 0) {
      const updated = await this.repo.findOne({ where: { id }, relations: ['assigned_employees', 'task_status'] });
      return {
        message: 'Task updated successfully.',
        data: updated,
      };
    } else {
      return {
        message: 'Task not found or not updated.',
        data: null,
      };
    }
  }

  async remove(id: number) {
    const result = await this.repo.delete(id);
    if (result.affected && result.affected > 0) {
      return {
        message: 'Task deleted successfully.',
        id,
        status: 'success',
      };
    } else {
      return {
        message: 'Task not found.',
        id,
        status: 'not_found',
      };
    }
  }
}
