import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmpDepartments } from '../../models/emp_departments.entity';
import { EmpJobTitles } from '../../models/emp_job_titles.entity';
import { Employees } from '../../models/employees.entity';
import { UpdateEmployeeDto } from './dto/update.dto';
import { CreateEmployeeDto } from './dto/create.dto';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employees)
    private readonly repo: Repository<Employees>,
  ) {}

  create(createDto: CreateEmployeeDto) {
    const createData: any = { ...createDto };
    if (createDto.emp_department) {
      createData.emp_department = { id: createDto.emp_department } as EmpDepartments;
    }
    if (createDto.emp_job_title) {
      createData.emp_job_title = { id: createDto.emp_job_title } as EmpJobTitles;
    }
    const employee = this.repo.create(createData);
    return this.repo.save(employee);
  }

  findAll() {
    return this.repo.find({ relations: ['emp_department', 'emp_job_title'] });
  }

  findOne(id: number) {
    return this.repo.findOne({ where: { id }, relations: ['emp_department', 'emp_job_title'] });
  }

  async update(id: number, updateDto: UpdateEmployeeDto) {
    const updateData: any = { ...updateDto };
    if (updateDto.emp_department) {
      updateData.emp_department = { id: updateDto.emp_department } as EmpDepartments;
    }
    if (updateDto.emp_job_title) {
      updateData.emp_job_title = { id: updateDto.emp_job_title } as EmpJobTitles;
    }
    return this.repo.update(id, updateData);
  }

  remove(id: number) {
    return this.repo.delete(id);
  }
}
