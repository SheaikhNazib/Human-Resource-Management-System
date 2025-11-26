import { Controller, Get, Post, Body, Param, Delete, Patch, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create.dto';
import { UpdateEmployeeDto } from './dto/update.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';

@ApiTags('Employees')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}


  @Post()
  @ApiOperation({ summary: 'Create employee' })
  @ApiBody({ type: CreateEmployeeDto })
  @ApiResponse({ status: 201, description: 'Employee created successfully.' })
  create(@Body() createDto: CreateEmployeeDto) {
    return this.employeesService.create(createDto);
  }


  @Get()
  @ApiOperation({ summary: 'Get all employees' })
  @ApiResponse({ status: 200, description: 'List of employees.' })
  async findAll() {
    const data = await this.employeesService.findAll();
    return {
      message: data.length ? 'Employees fetched successfully.' : 'No employees found.',
      data
    };
  }


  @Get(':id')
  @ApiOperation({ summary: 'Get employee by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Employee details.' })
  findOne(@Param('id') id: number) {
    return this.employeesService.findOne(id);
  }


  @Patch(':id')
  @ApiOperation({ summary: 'Update employee' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateEmployeeDto })
  @ApiResponse({ status: 200, description: 'Employee updated successfully.' })
  update(@Param('id') id: number, @Body() updateDto: UpdateEmployeeDto) {
    return this.employeesService.update(id, updateDto);
  }


  @Delete(':id')
  @ApiOperation({ summary: 'Delete employee' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Employee deleted successfully.' })
  remove(@Param('id') id: number) {
    return this.employeesService.remove(id);
  }
}
