import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmpDepartments } from '../../models/emp_departments.entity';
import { EmpDepartmentsService } from './emp_departments.service';
import { EmpDepartmentsController } from './emp_departments.controller';

@Module({
  imports: [TypeOrmModule.forFeature([EmpDepartments])],
  controllers: [EmpDepartmentsController],
  providers: [EmpDepartmentsService],
})
export class EmpDepartmentsModule {}
