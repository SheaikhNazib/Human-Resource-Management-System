import { Controller, Get, Post, Body, Param, Delete, Patch, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { TaskStatusesService } from './task_statuses.service';
import { CreateTaskStatusDto } from './dto/create.dto';
import { UpdateTaskStatusDto } from './dto/update.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';

@ApiTags('TaskStatuses')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
@Controller('task-statuses')
export class TaskStatusesController {
  constructor(private readonly taskStatusesService: TaskStatusesService) {}

  @Post()
  @ApiOperation({ summary: 'Create task status' })
  @ApiBody({ type: CreateTaskStatusDto })
  @ApiResponse({ status: 201, description: 'Task status created' })
  create(@Body() createDto: CreateTaskStatusDto) {
    return this.taskStatusesService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all task statuses' })
  @ApiResponse({ status: 200, description: 'List of task statuses' })
  findAll() {
    return this.taskStatusesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task status by id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Task status found' })
  findOne(@Param('id') id: number) {
    return this.taskStatusesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update task status by id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateTaskStatusDto })
  @ApiResponse({ status: 200, description: 'Task status updated' })
  update(@Param('id') id: number, @Body() updateDto: UpdateTaskStatusDto) {
    return this.taskStatusesService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete task status by id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Task status deleted' })
  remove(@Param('id') id: number) {
    return this.taskStatusesService.remove(id);
  }
}
