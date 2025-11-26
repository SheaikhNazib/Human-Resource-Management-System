import { Controller, Get, Post, Body, Param, Put, Delete, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { CreateEmpAttendanceDto } from './dto/create.dto';
import { UpdateEmpAttendanceDto } from './dto/update.dto';
import { EmpAttendancesService } from './emp_attendances.service';
import { EmployeesService } from '../employees/employees.service';

@ApiTags('EmployeeAttendances')
@Controller('emp-attendances')
export class EmpAttendancesController {
  constructor(private readonly empAttendancesService: EmpAttendancesService, private readonly employeesService: EmployeesService) {}

  @Post()
  @ApiOperation({ summary: 'Create employee attendance' })
  @ApiBody({ type: CreateEmpAttendanceDto })
  @ApiResponse({ status: 201, description: 'Attendance created' })
  async create(@Body() createDto: CreateEmpAttendanceDto) {
    const getEmployee = await this.employeesService.findOneById(createDto.employee);
    return this.empAttendancesService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all employee attendances' })
  @ApiResponse({ status: 200, description: 'List of attendances' })
  findAll() {
    return this.empAttendancesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get attendance by id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Attendance found' })
  findOne(@Param('id') id: number) {
    return this.empAttendancesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update attendance by id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateEmpAttendanceDto })
  @ApiResponse({ status: 200, description: 'Attendance updated' })
  update(@Param('id') id: number, @Body() updateDto: UpdateEmpAttendanceDto) {
    return this.empAttendancesService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete attendance by id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Attendance deleted' })
  remove(@Param('id') id: number) {
    return this.empAttendancesService.remove(id);
  }
}
