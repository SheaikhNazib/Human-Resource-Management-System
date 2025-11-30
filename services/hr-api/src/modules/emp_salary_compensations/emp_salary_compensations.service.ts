import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmpSalaryCompensations } from '../../models/emp_salary_compensations.entity';
import { CreateEmpSalaryCompensationDto } from './dto/create.dto';
import { UpdateEmpSalaryCompensationDto } from './dto/update.dto';
import { Employees } from '../../models/employees.entity';

@Injectable()
export class EmpSalaryCompensationsService {
  constructor(
    @InjectRepository(EmpSalaryCompensations)
    private readonly repo: Repository<EmpSalaryCompensations>,
    @InjectRepository(Employees)
    private readonly empRepo: Repository<Employees>,
  ) {}

  async create(dto: CreateEmpSalaryCompensationDto) {
    const employee = await this.empRepo.findOne({ where: { id: dto.employee } });
    if (!employee) throw new NotFoundException('Employee id does not exist');
    const entity = this.repo.create({ ...dto, employee });
    return this.repo.save(entity);
  }

  async findAll(page: number, limit: number, sortBy: string, sortOrder: string = 'asc', date?: string): Promise<any> {
    // ASC = newest first (DESC order), DESC = oldest first (ASC order)
    const orderDirection = sortOrder.toLowerCase() === 'asc' ? 'DESC' : 'ASC';
    
    let queryBuilder = this.repo.createQueryBuilder('emp_salary_compensations')
      .leftJoinAndSelect('emp_salary_compensations.employee', 'employee');
    
    if (date) {
      // Parse the date to get year and month
      const dateObj = new Date(date);
      const year = dateObj.getFullYear();
      const month = dateObj.getMonth() + 1; // getMonth() returns 0-11, so add 1
      
      // Calculate start and end of the month
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);
      
      // Filter by payable_date within the month range (PostgreSQL compatible)
      queryBuilder.where(
        'emp_salary_compensations.payable_date >= :startDate AND emp_salary_compensations.payable_date <= :endDate',
        { startDate, endDate }
      );
    }
    
    // Get total count
    const allTotal = await queryBuilder.getCount();
    
    // Apply ordering
    queryBuilder = queryBuilder.orderBy(`emp_salary_compensations.${sortBy}`, orderDirection);
    
    // Apply pagination
    const totalPages = Math.ceil(allTotal / limit);
    queryBuilder = queryBuilder
      .skip((page - 1) * limit)
      .take(limit);
    
    const data = await queryBuilder.getMany();
    
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
    return this.repo.findOne({ where: { id }, relations: ['employee'] });
  }

  async update(id: number, dto: UpdateEmpSalaryCompensationDto) {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('Compensation not found');
    if (dto.employee) {
      const employee = await this.empRepo.findOne({ where: { id: dto.employee } });
      if (!employee) throw new NotFoundException('Employee id does not exist');
      entity.employee = employee;
    }
    Object.assign(entity, dto);
    return this.repo.save(entity);
  }

  async remove(id: number) {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('Compensation not found');
    return this.repo.softRemove(entity);
  }
}
