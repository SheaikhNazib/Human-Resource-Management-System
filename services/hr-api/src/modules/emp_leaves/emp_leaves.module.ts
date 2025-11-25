import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmpLeaves } from '../../models/emp_leaves.entity';
import { Employees } from '../../models/employees.entity';
import { EmpLeavesService } from './emp_leaves.service';
import { EmpLeavesController } from './emp_leaves.controller';

@Module({
  imports: [TypeOrmModule.forFeature([EmpLeaves, Employees])],
  providers: [EmpLeavesService],
  controllers: [EmpLeavesController],
  exports: [EmpLeavesService],
})
export class EmpLeavesModule {}
