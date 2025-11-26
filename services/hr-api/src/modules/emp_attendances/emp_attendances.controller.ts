import { Controller, Get, Post, Body, Param, Put, Delete, Patch, Query, HttpStatus, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { CreateEmpAttendanceDto } from './dto/create.dto';
import { UpdateEmpAttendanceDto } from './dto/update.dto';
import { EmpAttendancesService } from './emp_attendances.service';
import { EmployeesService } from '../employees/employees.service';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';


@ApiTags('EmployeeAttendances')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
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
  @ApiQuery({ name: 'page', type: Number, required: false, example: 1 })
  @ApiQuery({ name: 'limit', type: Number, required: false, example: 10 })
  @ApiQuery({ name: 'sortBy', type: String, required: false, enum: ['createdAt', 'updatedAt'], example: 'createdAt' })
  @ApiQuery({ name: 'sortOrder', type: String, required: false, enum: ['asc', 'desc'], example: 'asc' })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('sortBy') sortBy: string = 'createdAt',
    @Query('sortOrder') sortOrder: string = 'asc',
    @Res() res: Response  
  ) {
    const response = await this.empAttendancesService.findAll(page, limit, sortBy, sortOrder);
    return res.status(HttpStatus.OK).json({ 
      success: true, data: response.data, metaData: response.metaData,
      message: response.data.length > 0 ? 'Attendances fetched successfully!' : 'No attendances found!' 
    });
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
