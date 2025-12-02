import { Controller, Get, Post, Body, Param, Put, Delete, Patch, Query, HttpStatus, Res, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { CreateEmpAttendanceDto } from './dto/create.dto';
import { BulkCreateEmpAttendanceDto } from './dto/bulk-create.dto';
import { UpdateEmpAttendanceDto } from './dto/update.dto';
import { EmpAttendancesService } from './emp_attendances.service';
import { EmployeesService } from '../employees/employees.service';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { getDateExamples } from './emp_attendances.function';
import { Roles } from 'src/common/guards/roles.enum';
import { RequireRoles } from 'src/common/guards/roles.decorator';


@ApiTags('EmployeeAttendances')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
@Controller('emp-attendances')
export class EmpAttendancesController {
  constructor(private readonly empAttendancesService: EmpAttendancesService, private readonly employeesService: EmployeesService) { }

  @Post()
  @RequireRoles(Roles.SUPER_ADMIN, Roles.HR_MANAGER, Roles.MANAGER)
  @ApiOperation({ summary: 'Create employee attendance' })
  @ApiBody({ type: CreateEmpAttendanceDto })
  @ApiResponse({ status: 201, description: 'Attendance created' })
  async create(@Body() createDto: CreateEmpAttendanceDto) {
    // const getEmployee = await this.employeesService.findOneById(createDto.employee);
    return this.empAttendancesService.create(createDto);
  }

  @Post('bulk')
  @RequireRoles(Roles.SUPER_ADMIN, Roles.HR_MANAGER, Roles.MANAGER, Roles.ACCOUNTANT)
  @ApiOperation({ summary: 'Bulk create employee attendances' })
  @ApiBody({ type: BulkCreateEmpAttendanceDto })
  @ApiResponse({ status: 201, description: 'Attendances created successfully' })
  async bulkCreate(@Body() bulkCreateDto: BulkCreateEmpAttendanceDto, @Res() res: Response) {
    try {
      const response = await this.empAttendancesService.bulkCreate(bulkCreateDto.attendances);
      if (response.success) {
        return res.status(HttpStatus.CREATED).json({
          success: true,
          data: response.data,
          message: response.message,
          metaData: {
            totalCreated: response.totalCreated,
          },
        });
      } else {
        // Handle validation errors (400) vs server errors (500)
        const statusCode = response.statusCode === 400 ? HttpStatus.BAD_REQUEST : HttpStatus.INTERNAL_SERVER_ERROR;
        return res.status(statusCode).json({
          success: false,
          data: null,
          message: response.message || 'Failed to create attendances',
          ...(response.invalidEmployeeIds && { invalidEmployeeIds: response.invalidEmployeeIds }),
        });
      }
    } catch (error) {
      console.error(error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        data: null,
        message: 'Internal server error occurred. Please try again later!',
      });
    }
  }

  @Get()
  @RequireRoles(Roles.SUPER_ADMIN, Roles.HR_MANAGER, Roles.MANAGER, Roles.ACCOUNTANT)
  @ApiOperation({ summary: 'Get all employee attendances' })
  @ApiResponse({ status: 200, description: 'List of attendances' })
  @ApiQuery({ name: 'page', type: Number, required: false, example: 1 })
  @ApiQuery({ name: 'limit', type: Number, required: false, example: 10 })
  @ApiQuery({ name: 'sortBy', type: String, required: false, enum: ['createdAt', 'updatedAt'], example: 'createdAt' })
  @ApiQuery({ name: 'sortOrder', type: String, required: false, enum: ['asc', 'desc'], example: 'asc' })
  @ApiQuery({ name: 'date', type: String, required: false, example: '2025-11-26', description: 'Filter by date in YYYY-MM-DD format. If provided, returns all attendances for that date.' })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('sortBy') sortBy: string = 'createdAt',
    @Query('sortOrder') sortOrder: string = 'asc',
    @Query('date') date: string | undefined = undefined,
    @Res() res: Response
  ) {
    const response = await this.empAttendancesService.findAll(page, limit, sortBy, sortOrder, date);
    return res.status(HttpStatus.OK).json({
      success: true, data: response.data, metaData: response.metaData,
      message: response.data.length > 0 ? 'Attendances fetched successfully!' : 'No attendances found!'
    });
  }

  @Get('total-attendance-count')
  @RequireRoles(Roles.SUPER_ADMIN, Roles.HR_MANAGER, Roles.MANAGER, Roles.ACCOUNTANT)
  @ApiQuery({ name: 'date', type: String, required: false, example: '2025-11-26', description: 'Date in YYYY-MM-DD format. If not provided, uses current date.' })
  @ApiOperation({ summary: 'Get total attendance count for a specific date' })
  @ApiResponse({ status: 200, description: 'Total attendance count for the specified date' })
  async getTotalAttendanceCount(@Res() res: Response, @Query('date') date?: string) {
    try {
      const queryDate = date || new Date().toISOString().split('T')[0];
      const response = await this.empAttendancesService.getTotalAttendanceCount(queryDate);
      return res.status(HttpStatus.OK).json({
        success: true, data: { date: queryDate, totalAttendance: response },
        message: `Total attendance count fetched successfully!`
      });
    }
    catch (error) {
      console.error(error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false, data: null, message: 'Internal server error occurred. Please try again later!'
      });
    }
  }

  @Get('attendance-overview')
  @RequireRoles(Roles.SUPER_ADMIN, Roles.HR_MANAGER, Roles.MANAGER, Roles.ACCOUNTANT)
  @ApiOperation({ summary: 'Get attendance overview statistics (On Time, Late, Remote counts)' })
  @ApiQuery({ name: 'startDate', type: String, required: true, example: getDateExamples().startDate, description: 'Start date in YYYY-MM-DD format' })
  @ApiQuery({ name: 'endDate', type: String, required: true, example: getDateExamples().endDate, description: 'End date in YYYY-MM-DD format' })
  @ApiResponse({ status: 200, description: 'Attendance overview statistics' })
  async getAttendanceOverview(@Query('startDate') startDate: string, @Query('endDate') endDate: string, @Res() res: Response) {
    try {
      const start = new Date(startDate.split('T')[0]);
      const end = new Date(endDate.split('T')[0]);
      
      if(isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false, data: null, message: 'Invalid date format. Please use YYYY-MM-DD format'
        });
      }
      if(end.getTime() < start.getTime()) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false, data: null, message: 'endDate must be greater than or equal to startDate'
        });
      }
      const response = await this.empAttendancesService.getAttendanceOverview(startDate, endDate);
      return res.status(HttpStatus.OK).json({
        success: true, data: response, message: 'Attendance overview fetched successfully!'
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false, data: null, message: 'Internal server error occurred. Please try again later!'
      });
    }
  }

  @Get('my-attendance')
  @RequireRoles(Roles.EMPLOYEE)
  @ApiOperation({ summary: 'Get my attendance records within a date range (Employee only)' })
  @ApiQuery({ name: 'startDate', type: String, required: true, example: getDateExamples().startDate, description: 'Start date in YYYY-MM-DD format' })
  @ApiQuery({ name: 'endDate', type: String, required: true, example: getDateExamples().endDate, description: 'End date in YYYY-MM-DD format' })
  @ApiResponse({ status: 200, description: 'My attendance records fetched successfully' })
  async getMyAttendance(@Query('startDate') startDate: string, @Query('endDate') endDate: string, @Req() req: any, @Res() res: Response) {
    try {
      const user = req.user;
      if (!user || !user.id) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          success: false, data: null, message: 'User not found in token!'
        });
      }
      const start = new Date(startDate.split('T')[0]);
      const end = new Date(endDate.split('T')[0]);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false, data: null, message: 'Invalid date format. Please use YYYY-MM-DD format'
        });
      }
      if (end.getTime() < start.getTime()) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false, data: null, message: 'endDate must be greater than or equal to startDate'
        });
      }
      const response = await this.empAttendancesService.getMyAttendance(user.id, startDate, endDate);

      return res.status(HttpStatus.OK).json({
        success: true, data: response.data, metaData: response.metaData,
        message: response.data.attendance.length > 0 ? 'My attendance fetched successfully!' : 'No attendance records found for the specified date range!'
      });
    } catch (error) {
      console.error(error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false, data: null, message: 'Internal server error occurred. Please try again later!'
      });
    }
  }

  @Get(':id')
  @RequireRoles(Roles.SUPER_ADMIN, Roles.HR_MANAGER, Roles.MANAGER, Roles.ACCOUNTANT)
  @ApiOperation({ summary: 'Get attendance by id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Attendance found' })
  findOne(@Param('id') id: number) {
    return this.empAttendancesService.findOne(id);
  }

  @Patch(':id')
  @RequireRoles(Roles.SUPER_ADMIN, Roles.HR_MANAGER, Roles.MANAGER, Roles.ACCOUNTANT)
  @ApiOperation({ summary: 'Update attendance by id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateEmpAttendanceDto })
  @ApiResponse({ status: 200, description: 'Attendance updated' })
  update(@Param('id') id: number, @Body() updateDto: UpdateEmpAttendanceDto) {
    return this.empAttendancesService.update(id, updateDto);
  }

  @Delete(':id')
  @RequireRoles(Roles.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete attendance by id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Attendance deleted' })
  remove(@Param('id') id: number) {
    return this.empAttendancesService.remove(id);
  }
}
