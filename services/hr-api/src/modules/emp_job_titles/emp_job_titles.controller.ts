import { Controller, Get, Post, Body, Param, Delete, Patch, UseGuards, HttpStatus, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { EmpJobTitlesService } from './emp_job_titles.service';
import { CreateEmpJobTitleDto } from './dto/create.dto';
import { UpdateEmpJobTitleDto } from './dto/update.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { RequireRoles } from 'src/common/guards/roles.decorator';
import { Roles } from 'src/common/guards/roles.enum';
import { Response } from 'express';
import { EmpDepartmentsService } from '../emp_departments/emp_departments.service';

@ApiTags('EmployeeJobTitles')
@UseGuards(JwtAuthGuard, RolesGuard)
@RequireRoles(Roles.SUPER_ADMIN, Roles.HR_MANAGER, Roles.MANAGER)
@ApiBearerAuth('JWT-auth')
@Controller('emp-job-titles')
export class EmpJobTitlesController {
  constructor(
    private readonly empJobTitlesService: EmpJobTitlesService,
    private readonly empDepartmentsService: EmpDepartmentsService
  ) { }

  @Post()
  @ApiOperation({ summary: 'Create job title' })
  @ApiBody({ type: CreateEmpJobTitleDto })
  @ApiResponse({ status: 201, description: 'Job title created' })
  async create(@Body() createDto: CreateEmpJobTitleDto, @Res() res: Response) {
    try {
      const department = await this.empDepartmentsService.findOne(createDto.emp_department);
      if (!department) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false, data: null, message: 'Department not found!'
        });
      }
      const jobTitle = await this.empJobTitlesService.create(createDto);
      if (!jobTitle) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false, data: null, message: 'Job title not created!'
        });
      }
      return res.status(HttpStatus.CREATED).json({
        success: true, data: jobTitle, message: 'Job title created successfully!'
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false, data: null, message: 'Internal server error occurred. Please try again later!'
      });
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all job titles' })
  @ApiResponse({ status: 200, description: 'List of job titles' })
  async findAll(@Res() res: Response) {
    try {
      const data = await this.empJobTitlesService.findAll();
      return res.status(HttpStatus.OK).json({
        success: true, data, message: 'Job titles fetched successfully!'
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false, data: null, message: 'Internal server error occurred. Please try again later!'
      });
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get job title by id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Job title found' })
  async findOne(@Param('id') id: number, @Res() res: Response) {
    try {
      const data = await this.empJobTitlesService.findOne(id);
      if (!data) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false, data: null, message: 'Job title not found!'
        });
      }
      return res.status(HttpStatus.OK).json({
        success: true, data, message: 'Job title fetched successfully!'
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false, data: null, message: 'Internal server error occurred. Please try again later!'
      });
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update job title by id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateEmpJobTitleDto })
  @ApiResponse({ status: 200, description: 'Job title updated' })
  async update(@Param('id') id: number, @Body() updateDto: UpdateEmpJobTitleDto, @Res() res: Response) {
    try {
      const data = await this.empJobTitlesService.findOne(id);
      if (!data) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false, data: null, message: 'Job title not found!'
        });
      }
      if (updateDto.emp_department) {
        const department = await this.empDepartmentsService.findOne(updateDto.emp_department);
        if (!department) {
          return res.status(HttpStatus.NOT_FOUND).json({
            success: false, data: null, message: 'Department not found!'
          });
        }
      }
      const updatedData = await this.empJobTitlesService.update(id, updateDto);
      if (!updatedData) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false, data: null, message: 'Job title not updated!'
        });
      }
      return res.status(HttpStatus.OK).json({
        success: true, data: updatedData, message: 'Job title updated successfully!'
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false, data: null, message: 'Internal server error occurred. Please try again later!'
      });
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete job title by id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Job title deleted' })
  async remove(@Param('id') id: number, @Res() res: Response) {
    try {
      const result = await this.empJobTitlesService.remove(id);
      if (result && result.affected && result.affected > 0) {
        return res.status(HttpStatus.OK).json({
          success: true, data: null, message: 'Job title deleted successfully!'
        });
      } else {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false, data: null, message: 'Job title not found or not removed!'
        });
      }
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false, data: null, message: 'Internal server error occurred. Please try again later!'
      });
    }
  }
}
