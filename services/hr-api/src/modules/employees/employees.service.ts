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

  async create(createDto: CreateEmployeeDto) {
    try {
      if (!createDto.emp_department) {
        return {
          statusCode: 400,
          message: 'emp_department_id is required',
          error: 'Bad Request'
        };
      }
      if (!createDto.emp_job_title) {
        return {
          statusCode: 400,
          message: 'emp_job_title_id is required',
          error: 'Bad Request'
        };
      }
      // Check if emp_department exists
      const departmentRepo = this.repo.manager.getRepository(EmpDepartments);
      const department = await departmentRepo.findOneBy({ id: createDto.emp_department });
      if (!department) {
        return {
          statusCode: 400,
          message: `emp_department with id ${createDto.emp_department} does not exist`,
          error: 'Bad Request'
        };
      }
      // Check if emp_job_title exists (if provided)
      let jobTitle: EmpJobTitles | null = null;
      if (createDto.emp_job_title) {
        const jobTitleRepo = this.repo.manager.getRepository(EmpJobTitles);
        jobTitle = await jobTitleRepo.findOneBy({ id: createDto.emp_job_title });
        if (!jobTitle) {
          return {
            statusCode: 400,
            message: `emp_job_title with id ${createDto.emp_job_title} does not exist`,
            error: 'Bad Request'
          };
        }
      }
      const createData: any = { ...createDto };
      createData.emp_department = { id: createDto.emp_department } as EmpDepartments;
      if (jobTitle) {
        createData.emp_job_title = { id: createDto.emp_job_title } as EmpJobTitles;
      }
      const employee = this.repo.create(createData);
      return await this.repo.save(employee);
    } catch (error: any) {
      if (error.code === '23505') {
        // Unique violation
        const detail = error.detail || '';
        let field = 'unique field';
        let value = '';
        const fieldMatch = detail.match(/\(([^)]+)\)=/);
        const valueMatch = detail.match(/=\(([^)]+)\)/);
        if (fieldMatch && fieldMatch[1]) field = fieldMatch[1];
        if (valueMatch && valueMatch[1]) value = valueMatch[1];
        return {
          statusCode: 400,
          message: `${field} must be unique. Duplicate value: ${value}`,
          error: 'Bad Request'
        };
      }
      throw error;
    }
  }

  findAll() {
    return this.repo.find({ relations: ['emp_department', 'emp_job_title'] });
  }

  findOne(id: number) {
    return this.repo.findOne({ where: { id }, relations: ['emp_department', 'emp_job_title'] });
  }

  findOneByEmail(email: string) {
    return this.repo.findOne({ where: { work_email: email }});
  }

  async findOneById(id: number) {
    const employee = await this.repo.findOneBy({ id });
    return employee;
  }

  async update(id: number, updateDto: UpdateEmployeeDto) {
    const updateData: any = { ...updateDto };
    if (updateDto.emp_department) {
      updateData.emp_department = { id: updateDto.emp_department } as EmpDepartments;
    }
    if (updateDto.emp_job_title) {
      updateData.emp_job_title = { id: updateDto.emp_job_title } as EmpJobTitles;
    }
    const result = await this.repo.update(id, updateData);
    if (result.affected && result.affected > 0) {
      const updated = await this.repo.findOne({ where: { id }, relations: ['emp_department', 'emp_job_title'] });
      return {
        message: 'Employee updated successfully.',
        data: updated,
      };
    } else {
      return {
        message: 'Employee not found or not updated.',
        data: null,
      };
    }
  }

  remove(id: number) {
    return this.repo.delete(id);
  }
}
