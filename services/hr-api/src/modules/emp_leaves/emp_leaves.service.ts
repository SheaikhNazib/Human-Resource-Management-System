import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmpLeaves } from '../../models/emp_leaves.entity';
import { CreateEmpLeaveDto } from './dto/create.dto';
import { UpdateEmpLeaveDto } from './dto/update.dto';
import { Employees } from '../../models/employees.entity';

@Injectable()
export class EmpLeavesService {
  constructor(
    @InjectRepository(EmpLeaves)
    private readonly repo: Repository<EmpLeaves>,
    @InjectRepository(Employees)
    private readonly empRepo: Repository<Employees>,
  ) {}

  private calculateLeaveDays(start: string, end: string): number {
    const startDate = new Date(start);
    const endDate = new Date(end);
    // +1 to include both start and end dates
    return Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }

  async create(dto: CreateEmpLeaveDto) {
    const employee = await this.empRepo.findOne({ where: { id: dto.employee } });
    if (!employee) throw new NotFoundException('employee id does not exist');
    const leave_days = dto.leave_days ?? this.calculateLeaveDays(dto.start_date, dto.end_date);
    const entity = this.repo.create({ ...dto, employee, leave_days });
    try {
      return await this.repo.save(entity);
    } catch (error) {
      const errMsg = (error instanceof Error) ? error.message : 'Internal server error';
      return { statusCode: 500, message: errMsg };
    }
  }

  async findAll() {
    try {
      return await this.repo.find({ relations: ['employee'] });
    } catch (error) {
      const errMsg = (error instanceof Error) ? error.message : 'Internal server error';
      return { statusCode: 500, message: errMsg };
    }
  }

  async findOne(id: number) {
    const leave = await this.repo.findOne({ where: { id }, relations: ['employee'] });
    if (!leave) throw new NotFoundException('Leave not found');
    return leave;
  }

  async update(id: number, dto: UpdateEmpLeaveDto) {
    const leave = await this.repo.findOne({ where: { id } });
    if (!leave) throw new NotFoundException('Leave not found');
    if (dto.employee) {
      const employee = await this.empRepo.findOne({ where: { id: dto.employee } });
      if (!employee) throw new NotFoundException('employee id does not exist');
      leave.employee = employee;
    }
    if (dto.start_date) leave.start_date = dto.start_date;
    if (dto.end_date) leave.end_date = dto.end_date;
    if (dto.reason) leave.reason = dto.reason;
    if (dto.status) leave.status = dto.status;
    leave.leave_days = dto.leave_days ?? this.calculateLeaveDays(leave.start_date, leave.end_date);
    return this.repo.save(leave);
  }

  async remove(id: number) {
    const leave = await this.repo.findOne({ where: { id } });
    if (!leave) throw new NotFoundException('Leave not found');
    return this.repo.delete(id);
  }
}
