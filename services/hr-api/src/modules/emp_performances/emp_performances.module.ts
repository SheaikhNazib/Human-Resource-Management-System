import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmpPerformances } from '../../models/emp_performances.entity';
import { EmpPerformancesService } from './emp_performances.service';
import { EmpPerformancesController } from './emp_performances.controller';

@Module({
  imports: [TypeOrmModule.forFeature([EmpPerformances])],
  controllers: [EmpPerformancesController],
  providers: [EmpPerformancesService],
})
export class EmpPerformancesModule {}
