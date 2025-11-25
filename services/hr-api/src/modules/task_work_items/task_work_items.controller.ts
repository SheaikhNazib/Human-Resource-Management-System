
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { TaskWorkItemsService } from './task_work_items.service';
import { CreateTaskWorkItemDto } from './dto/create.dto';
import { UpdateTaskWorkItemDto } from './dto/update.dto';

@ApiTags('TaskWorkItems')
@Controller('task-work-items')
export class TaskWorkItemsController {
  constructor(private readonly service: TaskWorkItemsService) {}


  @Post()
  @ApiOperation({ summary: 'Create a task work item' })
  @ApiBody({ type: CreateTaskWorkItemDto })
  @ApiResponse({ status: 201, description: 'The task work item has been successfully created.' })
  create(@Body() dto: CreateTaskWorkItemDto) {
    return this.service.create(dto);
  }


  @Get()
  @ApiOperation({ summary: 'Get all task work items' })
  @ApiResponse({ status: 200, description: 'List of task work items.' })
  async findAll() {
    const data = await this.service.findAll();
    return {
      message: data.length ? 'Task work items fetched successfully.' : 'No task work items found.',
      data,
      count: data.length
    };
  }


  @Get(':id')
  @ApiOperation({ summary: 'Get a task work item by id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'The found task work item.' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }


  @Patch(':id')
  @ApiOperation({ summary: 'Update a task work item' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateTaskWorkItemDto })
  @ApiResponse({ status: 200, description: 'The task work item has been updated.' })
  update(@Param('id') id: string, @Body() dto: UpdateTaskWorkItemDto) {
    return this.service.update(+id, dto);
  }


  @Delete(':id')
  @ApiOperation({ summary: 'Delete a task work item' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'The task work item has been deleted.' })
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
