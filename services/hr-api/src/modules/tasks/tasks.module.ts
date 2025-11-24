import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tasks } from '../../models/tasks.entity';
import { Employees } from '../../models/employees.entity';
import { TaskStatuses } from '../../models/task_statuses.entity';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  imports: [TypeOrmModule.forFeature([Tasks, Employees, TaskStatuses])],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
