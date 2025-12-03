import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from '../../models/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { EmployeesModule } from '../employees/employees.module';
import { EmpDepartmentsModule } from '../emp_departments/emp_departments.module';
import { EmpJobTitlesModule } from '../emp_job_titles/emp_job_titles.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Users]), 
    forwardRef(() => EmployeesModule),
    EmpDepartmentsModule,
    EmpJobTitlesModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

