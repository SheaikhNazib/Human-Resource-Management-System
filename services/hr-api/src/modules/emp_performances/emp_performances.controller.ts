
import { Controller, Get, Post, Body, Param, Delete, Patch, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { EmpPerformancesService } from './emp_performances.service';
import { CreateEmpPerformanceDto } from './dto/create.dto';
import { UpdateEmpPerformanceDto } from './dto/update.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { RequireRoles } from 'src/common/guards/roles.decorator';
import { Roles } from 'src/common/guards/roles.enum';

@ApiTags('EmployeePerformances')
@UseGuards(JwtAuthGuard, RolesGuard)
@RequireRoles(Roles.SUPER_ADMIN, Roles.HR_MANAGER, Roles.MANAGER, Roles.EMPLOYEE)
@ApiBearerAuth('JWT-auth')
@Controller('emp-performances')
export class EmpPerformancesController {
  constructor(private readonly empPerformancesService: EmpPerformancesService) {}

  @Post()
  @ApiOperation({ summary: 'Create employee performance' })
  @ApiBody({ type: CreateEmpPerformanceDto })
  @ApiResponse({ status: 201, description: 'Performance created successfully.' })
  create(@Body() createDto: CreateEmpPerformanceDto) {
    return this.empPerformancesService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all employee performances' })
  @ApiResponse({ status: 200, description: 'List of employee performances.' })
  findAll() {
    return this.empPerformancesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get employee performance by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Employee performance details.' })
  findOne(@Param('id') id: number) {
    return this.empPerformancesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update employee performance' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateEmpPerformanceDto })
  @ApiResponse({ status: 200, description: 'Performance updated successfully.' })
  update(@Param('id') id: number, @Body() updateDto: UpdateEmpPerformanceDto) {
    return this.empPerformancesService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete employee performance' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Performance deleted successfully.' })
  remove(@Param('id') id: number) {
    return this.empPerformancesService.remove(id);
  }
}
