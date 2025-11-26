import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmpAttendances } from '../../models/emp_attendances.entity';
import { EmpAttendancesService } from './emp_attendances.service';
import { EmpAttendancesController } from './emp_attendances.controller';
import { EmployeesModule } from '../employees/employees.module';

@Module({
  imports: [TypeOrmModule.forFeature([EmpAttendances]), EmployeesModule],
  controllers: [EmpAttendancesController],
  providers: [EmpAttendancesService],
})
export class EmpAttendancesModule {}
