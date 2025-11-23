import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { EmpDepartmentsService } from './emp_departments.service';
import { CreateEmpDepartmentDto } from './dto/create.dto';
import { UpdateEmpDepartmentDto } from './dto/update.dto';

@ApiTags('EmployeeDepartments')
@Controller('emp-departments')
export class EmpDepartmentsController {
  constructor(private readonly empDepartmentsService: EmpDepartmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create department' })
  @ApiBody({ type: CreateEmpDepartmentDto })
  @ApiResponse({ status: 201, description: 'Department created' })
  create(@Body() createDto: CreateEmpDepartmentDto) {
    return this.empDepartmentsService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all departments' })
  @ApiResponse({ status: 200, description: 'List of departments' })
  findAll() {
    return this.empDepartmentsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get department by id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Department found' })
  findOne(@Param('id') id: number) {
    return this.empDepartmentsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update department by id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateEmpDepartmentDto })
  @ApiResponse({ status: 200, description: 'Department updated' })
  update(@Param('id') id: number, @Body() updateDto: UpdateEmpDepartmentDto) {
    return this.empDepartmentsService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete department by id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Department deleted' })
  remove(@Param('id') id: number) {
    return this.empDepartmentsService.remove(id);
  }
}
