import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmpDepartments } from '../../models/emp_departments.entity';
import { CreateEmpDepartmentDto } from './dto/create.dto';
import { UpdateEmpDepartmentDto } from './dto/update.dto';


@Injectable()
export class EmpDepartmentsService {
  constructor(
    @InjectRepository(EmpDepartments)
    private readonly repo: Repository<EmpDepartments>,
  ) {}

  async create(createDto: CreateEmpDepartmentDto) {
    const exists = await this.repo.findOneBy({ name: createDto.name });
    if (exists) {
      return {
        message: 'A department with this name already exists.',
        data: exists,
        status: 'duplicate',
      };
    }
    const department = this.repo.create(createDto);
    const saved = await this.repo.save(department);
    return {
      message: 'Department created successfully.',
      data: saved,
      status: 'success',
    };
  }

  async findAll() {
    const data = await this.repo.find();
    return {
      message: data.length > 0 ? 'Departments fetched successfully.' : 'No departments found.',
      data,
    };
  }

  findOne(id: number) {
    return this.repo.findOneBy({ id });
  }

  update(id: number, updateDto: UpdateEmpDepartmentDto) {
    return this.repo.update(id, updateDto);
  }

  remove(id: number) {
    return this.repo.delete(id);
  }
}
