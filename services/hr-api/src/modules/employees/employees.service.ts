import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmpDepartments } from '../../models/emp_departments.entity';
import { EmpJobTitles } from '../../models/emp_job_titles.entity';
import { Employees } from '../../models/employees.entity';
import { UpdateEmployeeDto } from './dto/update.dto';
import { CreateEmployeeDto } from './dto/create.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employees)
    private readonly repo: Repository<Employees>,
  ) { }

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
      if (createData.password) {
        createData.password = await bcrypt.hash(createData.password, 10);
      } else {
        createData.password = await bcrypt.hash('123456', 10); // Default password is 123456
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

  async findAll(
    page: number,
    limit: number,
    sortBy: string,
    sortOrder: string = 'asc',
    filters?: {
      first_name?: string;
      last_name?: string;
      personal_email?: string;
      work_email?: string;
      mobile?: string;
      office_phone?: string;
      hire_date?: string;
      leave_date?: string;
      current_or_former_emp?: boolean | string;
      emp_department?: number | string;
      emp_job_title?: number | string;
    }
  ): Promise<any> {
    // Build base query with filtering first (before pagination and sorting)
    // Use inner join since relations are required (nullable: false) - faster than left join
    const queryBuilder = this.repo.createQueryBuilder('employee')
      .innerJoinAndSelect('employee.emp_department', 'emp_department')
      .innerJoinAndSelect('employee.emp_job_title', 'emp_job_title')
      // Exclude soft-deleted records
      .where('employee.deletedAt IS NULL');

    // Build filter conditions efficiently
    const filterParams: any = {};
    const filterConditions: string[] = [];

    if (filters) {
      if (filters.first_name) {
        filterConditions.push('employee.first_name ILIKE :first_name');
        filterParams.first_name = `%${filters.first_name}%`;
      }
      if (filters.last_name) {
        filterConditions.push('employee.last_name ILIKE :last_name');
        filterParams.last_name = `%${filters.last_name}%`;
      }
      if (filters.personal_email) {
        filterConditions.push('employee.personal_email ILIKE :personal_email');
        filterParams.personal_email = `%${filters.personal_email}%`;
      }
      if (filters.work_email) {
        filterConditions.push('employee.work_email ILIKE :work_email');
        filterParams.work_email = `%${filters.work_email}%`;
      }
      if (filters.mobile) {
        filterConditions.push('employee.mobile ILIKE :mobile');
        filterParams.mobile = `%${filters.mobile}%`;
      }
      if (filters.office_phone) {
        filterConditions.push('employee.office_phone ILIKE :office_phone');
        filterParams.office_phone = `%${filters.office_phone}%`;
      }
      if (filters.hire_date) {
        filterConditions.push('employee.hire_date = :hire_date');
        filterParams.hire_date = filters.hire_date;
      }
      if (filters.leave_date) {
        filterConditions.push('employee.leave_date = :leave_date');
        filterParams.leave_date = filters.leave_date;
      }
      if (filters.current_or_former_emp !== undefined && filters.current_or_former_emp !== null && filters.current_or_former_emp !== '') {
        const boolValue = filters.current_or_former_emp === 'true' || filters.current_or_former_emp === true;
        filterConditions.push('employee.current_or_former_emp = :current_or_former_emp');
        filterParams.current_or_former_emp = boolValue;
      }
      if (filters.emp_department) {
        filterConditions.push('employee.emp_department_id = :emp_department');
        filterParams.emp_department = Number(filters.emp_department);
      }
      if (filters.emp_job_title) {
        filterConditions.push('employee.emp_job_title_id = :emp_job_title');
        filterParams.emp_job_title = Number(filters.emp_job_title);
      }
    }

    // Apply all filter conditions at once for better performance
    if (filterConditions.length > 0) {
      queryBuilder.andWhere(`(${filterConditions.join(' AND ')})`, filterParams);
    }

    // Optimize count query - use a separate lightweight query without joins/selects
    const countQuery = this.repo.createQueryBuilder('employee')
      .where('employee.deletedAt IS NULL');

    if (filterConditions.length > 0) {
      countQuery.andWhere(`(${filterConditions.join(' AND ')})`, filterParams);
    }

    // Execute count and data queries in parallel for better performance
    const [allTotal, data] = await Promise.all([
      countQuery.getCount(),
      (async () => {
        // Apply sorting (ASC = newest first (DESC order), DESC = oldest first (ASC order))
        const orderDirection = sortOrder.toLowerCase() === 'asc' ? 'DESC' : 'ASC';
        queryBuilder.orderBy(`employee.${sortBy}`, orderDirection);

        // Apply pagination
        queryBuilder.skip((page - 1) * limit).take(limit);

        return await queryBuilder.getMany();
      })()
    ]);

    const totalPages = Math.ceil(allTotal / limit);

    return {
      metaData: {
        page: +page || 1,
        limit: +limit || 10,
        allTotal: +allTotal || 0,
        totalPages: +totalPages || 0,
      },
      data,
    };
  }

  findOne(id: number) {
    return this.repo.findOne({ where: { id }, relations: ['emp_department', 'emp_job_title'] });
  }

  findOneByEmail(email: string) {
    return this.repo
      .createQueryBuilder('employee')
      .where('employee.work_email = :email', { email })
      .orWhere('employee.personal_email = :email', { email })
      .getOne();
  }

  async findOneById(id: number) {
    const employee = await this.repo.findOne({ where: { id }, select: ['id', 'name', 'first_name', 'last_name'] });
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

