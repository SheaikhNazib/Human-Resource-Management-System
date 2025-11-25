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

  findAll() {
    return this.repo.find({ relations: ['employee'] });
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
