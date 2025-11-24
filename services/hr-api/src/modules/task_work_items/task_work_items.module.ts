import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskWorkItems } from '../../models/task_work_items.entity';
import { TaskWorkItemsService } from './task_work_items.service';
import { TaskWorkItemsController } from './task_work_items.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TaskWorkItems])],
  controllers: [TaskWorkItemsController],
  providers: [TaskWorkItemsService],
  exports: [TaskWorkItemsService],
})
export class TaskWorkItemsModule {}
