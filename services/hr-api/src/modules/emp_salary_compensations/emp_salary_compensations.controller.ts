
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { CreateEmpSalaryCompensationDto } from './dto/create.dto';
import { UpdateEmpSalaryCompensationDto } from './dto/update.dto';
import { EmpSalaryCompensationsService } from './emp_salary_compensations.service';

@ApiTags('EmployeeSalaryCompensations')
@Controller('emp-salary-compensations')
export class EmpSalaryCompensationsController {
  constructor(private readonly empSalaryCompensationsService: EmpSalaryCompensationsService) {}


  @Post()
  @ApiOperation({ summary: 'Create employee salary compensation' })
  @ApiBody({ type: CreateEmpSalaryCompensationDto })
  @ApiResponse({ status: 201, description: 'Created' })
  create(@Body() dto: CreateEmpSalaryCompensationDto) {
    return this.empSalaryCompensationsService.create(dto);
  }


  @Get()
  @ApiOperation({ summary: 'Get all employee salary compensations' })
  @ApiResponse({ status: 200, description: 'List of salary compensations' })
  findAll() {
    return this.empSalaryCompensationsService.findAll();
  }


  @Get(':id')
  @ApiOperation({ summary: 'Get a salary compensation by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Salary compensation detail' })
  findOne(@Param('id') id: string) {
    return this.empSalaryCompensationsService.findOne(+id);
  }


  @Patch(':id')
  @ApiOperation({ summary: 'Update a salary compensation' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateEmpSalaryCompensationDto })
  @ApiResponse({ status: 200, description: 'Updated' })
  update(@Param('id') id: string, @Body() dto: UpdateEmpSalaryCompensationDto) {
    return this.empSalaryCompensationsService.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a salary compensation' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Deleted' })
  remove(@Param('id') id: string) {
    return this.empSalaryCompensationsService.remove(+id);
  }
}
