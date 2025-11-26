import { Controller, Get, Post, Body, Param, Delete, Patch, UseGuards, Query, Res, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create.dto';
import { UpdateEmployeeDto } from './dto/update.dto';
import { QueryEmployeeDto } from './dto/query.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Response } from 'express';

@ApiTags('Employees')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) { }

  @Post()
  @ApiOperation({ summary: 'Create employee' })
  @ApiBody({ type: CreateEmployeeDto })
  @ApiResponse({ status: 201, description: 'Employee created successfully.' })
  async create(@Body() createDto: CreateEmployeeDto, @Res() res: Response) {
    try {
      const employee = await this.employeesService.create(createDto);
      return res.status(HttpStatus.CREATED).json({
        success: true, data: employee, message: 'Employee created successfully!'
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false, data: null, message: 'Internal server error occurred. Please try again later!'
      });
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all employees' })
  @ApiResponse({ status: 200, description: 'List of employees.' })
  async findAll(
    @Res() res: Response,
    @Query() query: QueryEmployeeDto
  ) {
    try {
      const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'asc', ...filters } = query;
      
      // Build filter object, excluding pagination and sorting params
      const filterObj = Object.keys(filters).length > 0 
        ? Object.fromEntries(Object.entries(filters).filter(([_, value]) => value !== undefined && value !== null && value !== ''))
        : undefined;

      const response = await this.employeesService.findAll(
        page, limit, sortBy, sortOrder, filterObj
      );
      return res.status(HttpStatus.OK).json({
        success: true, data: response.data, metaData: response.metaData,
        message: response.data.length > 0 ? 'Employees fetched successfully!' : 'No employees found!'
      });
    }
    catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false, data: null, message: 'Internal server error occurred. Please try again later!'
      });
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get employee by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Employee details.' })
  async findOne(@Param('id') id: number, @Res() res: Response) {
    try {
      const employee = await this.employeesService.findOne(id);
      if (!employee) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false, data: null, message: 'Employee not found!'
        });
      }
      return res.status(HttpStatus.OK).json({
        success: true, data: employee, message: 'Employee fetched successfully!'
      });
    }
    catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false, data: null, message: 'Internal server error occurred. Please try again later!'
      });
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update employee' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateEmployeeDto })
  @ApiResponse({ status: 200, description: 'Employee updated successfully.' })
  async update(@Param('id') id: number, @Body() updateDto: UpdateEmployeeDto, @Res() res: Response) {
    try {
      const updatedEmployee = await this.employeesService.update(id, updateDto);
      if (!updatedEmployee) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false, data: null, message: 'Employee not found!'
        });
      }
      return res.status(HttpStatus.OK).json({
        success: true, data: updatedEmployee, message: 'Employee updated successfully!'
      });
    }
    catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false, data: null, message: 'Internal server error occurred. Please try again later!'
      });
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete employee' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Employee deleted successfully.' })
  async remove(@Param('id') id: number, @Res() res: Response) {
    try {
      const result = await this.employeesService.remove(id);
      if (!result.affected || result.affected === 0) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false, data: null, message: 'Employee not found!'
        });
      }
      return res.status(HttpStatus.OK).json({
        success: true, data: null, message: 'Employee deleted successfully!'
      });
    }
    catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false, data: null, message: 'Internal server error occurred. Please try again later!'
      });
    }
  }
}
