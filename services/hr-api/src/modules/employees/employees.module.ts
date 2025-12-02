import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employees } from '../../models/employees.entity';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { EmpDepartmentsModule } from '../emp_departments/emp_departments.module';
import { EmpJobTitlesModule } from '../emp_job_titles/emp_job_titles.module';
import { MailModule } from '../email/mail.module';

@Module({
  imports: [TypeOrmModule.forFeature([Employees]), EmpDepartmentsModule, EmpJobTitlesModule, MailModule],
  controllers: [EmployeesController],
  providers: [EmployeesService],
  exports: [EmployeesService],
})
export class EmployeesModule {}
