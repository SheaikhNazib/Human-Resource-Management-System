import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employees } from '../../models/employees.entity';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Employees])],
  controllers: [EmployeesController],
  providers: [EmployeesService],
})
export class EmployeesModule {}
