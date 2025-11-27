import { Controller, Get, Post, Body, Param, Put, Delete, Patch, Query, Res, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { EmpDepartmentsService } from './emp_departments.service';
import { CreateEmpDepartmentDto } from './dto/create.dto';
import { UpdateEmpDepartmentDto } from './dto/update.dto';
import { Response } from 'express';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RequireRoles } from 'src/common/guards/roles.decorator';
import { Roles } from 'src/common/guards/roles.enum';

@ApiTags('EmployeeDepartments')
@UseGuards(JwtAuthGuard, RolesGuard)
@RequireRoles(Roles.SUPER_ADMIN, Roles.HR_MANAGER, Roles.MANAGER)
@ApiBearerAuth('JWT-auth')
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
  @ApiQuery({ name: 'page', type: Number, required: false, example: 1 })
  @ApiQuery({ name: 'limit', type: Number, required: false, example: 10 })
  @ApiQuery({ name: 'sortBy', type: String, required: false, enum: ['createdAt', 'updatedAt'], example: 'createdAt' })
  @ApiQuery({ name: 'sortOrder', type: String, required: false, enum: ['asc', 'desc'], example: 'asc' })
  @ApiOperation({ summary: 'Get all departments' })
  @ApiResponse({ status: 200, description: 'List of departments' })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('sortBy') sortBy: string = 'createdAt',
    @Query('sortOrder') sortOrder: string = 'asc',
    @Res() res: Response
  ): Promise<any> {
    const response = await this.empDepartmentsService.findAll(page, limit, sortBy, sortOrder);
    return res.status(HttpStatus.OK).json({ 
      success: true, data: response.data, metaData: response.metaData,
      message: response.data.length > 0 ? 'Departments fetched successfully!' : 'No departments found!' 
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get department by id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Department found' })
  findOne(@Param('id') id: number) {
    return this.empDepartmentsService.findOne(id);
  }

  @Patch(':id')
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
