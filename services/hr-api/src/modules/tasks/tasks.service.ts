import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Tasks } from '../../models/tasks.entity';
import { Employees } from '../../models/employees.entity';
import { CreateTaskDto } from './dto/create.dto';
import { UpdateTaskDto } from './dto/update.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Tasks)
    private readonly repo: Repository<Tasks>,
    @InjectRepository(Employees)
    private readonly empRepo: Repository<Employees>,
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
    const task = this.repo.create({ ...createDto, assigned_employees: employees });
    return this.repo.save(task);
  }

  async findAll() {
    const data = await this.repo.find({ relations: ['assigned_employees'] });
    return {
      message: data.length ? 'Tasks fetched successfully.' : 'No tasks found.',
      data,
    };
  }

  async findOne(id: number) {
    const data = await this.repo.findOne({ where: { id }, relations: ['assigned_employees'] });
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
    const updateData: any = { ...updateDto };
    if (employees) updateData.assigned_employees = employees;
    const result = await this.repo.update(id, updateData);
    if (result.affected && result.affected > 0) {
      const updated = await this.repo.findOne({ where: { id }, relations: ['assigned_employees'] });
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
