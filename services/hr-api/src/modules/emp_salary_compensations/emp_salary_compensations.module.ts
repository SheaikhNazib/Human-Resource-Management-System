import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmpSalaryCompensations } from '../../models/emp_salary_compensations.entity';
import { Employees } from '../../models/employees.entity';
import { EmpSalaryCompensationsService } from './emp_salary_compensations.service';
import { EmpSalaryCompensationsController } from './emp_salary_compensations.controller';

@Module({
  imports: [TypeOrmModule.forFeature([EmpSalaryCompensations, Employees])],
  controllers: [EmpSalaryCompensationsController],
  providers: [EmpSalaryCompensationsService],
  exports: [EmpSalaryCompensationsService],
})
export class EmpSalaryCompensationsModule {}
