
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, HttpStatus, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CreateEmpSalaryCompensationDto } from './dto/create.dto';
import { UpdateEmpSalaryCompensationDto } from './dto/update.dto';
import { EmpSalaryCompensationsService } from './emp_salary_compensations.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RequireRoles } from '../../common/guards/roles.decorator';
import { Roles } from '../../common/guards/roles.enum';
import { Response } from 'express';

@ApiTags('EmployeeSalaryCompensations')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
@Controller('emp-salary-compensations')
export class EmpSalaryCompensationsController {
  constructor(private readonly empSalaryCompensationsService: EmpSalaryCompensationsService) { }


  @Post()
  @RequireRoles(Roles.SUPER_ADMIN, Roles.HR_MANAGER, Roles.MANAGER, Roles.ACCOUNTANT)
  @ApiOperation({ summary: 'Create employee salary compensation' })
  @ApiBody({ type: CreateEmpSalaryCompensationDto })
  @ApiResponse({ status: 201, description: 'Created' })
  create(@Body() dto: CreateEmpSalaryCompensationDto) {
    return this.empSalaryCompensationsService.create(dto);
  }


  @Get()
  @RequireRoles(Roles.SUPER_ADMIN, Roles.HR_MANAGER, Roles.MANAGER, Roles.ACCOUNTANT)
  @ApiQuery({ name: 'page', type: Number, required: false, example: 1 })
  @ApiQuery({ name: 'limit', type: Number, required: false, example: 10 })
  @ApiQuery({ name: 'sortBy', type: String, required: false, enum: ['createdAt', 'updatedAt', 'payable_date'], example: 'createdAt' })
  @ApiQuery({ name: 'sortOrder', type: String, required: false, enum: ['asc', 'desc'], example: 'asc' })
  @ApiQuery({
    name: 'date', type: String, required: false, example: '2025-11-26',
    description: 'Filter by date in YYYY-MM-DD format. Returns all records where payable_date is in the same month as the provided date. If not provided, returns all records.'
  })
  @ApiOperation({ summary: 'Get all employee salary compensations' })
  @ApiResponse({ status: 200, description: 'List of salary compensations' })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('sortBy') sortBy: string = 'createdAt',
    @Query('sortOrder') sortOrder: string = 'asc',
    @Query('date') date: string | undefined = undefined,
    @Res() res: Response
  ) {
    try {
      const response = await this.empSalaryCompensationsService.findAll(page, limit, sortBy, sortOrder, date);
      return res.status(HttpStatus.OK).json({
        success: true, data: response.data, metaData: response.metaData,
        message: response.data.length > 0 ? 'Salary compensations fetched successfully!' : 'No salary compensations found!'
      });
    }
    catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false, data: null, message: 'Internal server error occurred. Please try again later!'
      });
    }
  }


  @Get(':id')
  @RequireRoles(Roles.SUPER_ADMIN, Roles.HR_MANAGER, Roles.MANAGER, Roles.ACCOUNTANT)
  @ApiOperation({ summary: 'Get a salary compensation by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Salary compensation detail' })
  findOne(@Param('id') id: string) {
    return this.empSalaryCompensationsService.findOne(+id);
  }


  @Patch(':id')
  @RequireRoles(Roles.SUPER_ADMIN, Roles.HR_MANAGER, Roles.MANAGER, Roles.ACCOUNTANT)
  @ApiOperation({ summary: 'Update a salary compensation' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateEmpSalaryCompensationDto })
  @ApiResponse({ status: 200, description: 'Updated' })
  update(@Param('id') id: string, @Body() dto: UpdateEmpSalaryCompensationDto) {
    return this.empSalaryCompensationsService.update(+id, dto);
  }

  @Delete(':id')
  @RequireRoles(Roles.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete a salary compensation' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Deleted' })
  remove(@Param('id') id: string) {
    return this.empSalaryCompensationsService.remove(+id);
  }
}
