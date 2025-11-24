import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskStatuses } from '../../models/task_statuses.entity';
import { TaskStatusesController } from './task_statuses.controller';
import { TaskStatusesService } from './task_statuses.service';

@Module({
  imports: [TypeOrmModule.forFeature([TaskStatuses])],
  controllers: [TaskStatusesController],
  providers: [TaskStatusesService],
  exports: [TaskStatusesService],
})
export class TaskStatusesModule {}
