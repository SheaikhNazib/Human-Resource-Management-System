import { Controller, Get, Post, Body, Param, Delete, Patch, UseGuards, Query, Res, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create.dto';
import { UpdateEmployeeDto } from './dto/update.dto';
import { QueryEmployeeDto } from './dto/query.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';
import { EmpDepartmentsService } from '../emp_departments/emp_departments.service';
import { EmpJobTitlesService } from '../emp_job_titles/emp_job_titles.service';

@ApiTags('Employees')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
@Controller('employees')
export class EmployeesController {
  constructor(
    private readonly employeesService: EmployeesService,
    private readonly empDepartmentsService: EmpDepartmentsService,
    private readonly empJobTitlesService: EmpJobTitlesService,
  ) { }

  @Post()
  @ApiOperation({ summary: 'Create employee' })
  @ApiBody({ type: CreateEmployeeDto })
  @ApiResponse({ status: 201, description: 'Employee created successfully.' })
  async create(@Body() createDto: CreateEmployeeDto, @Res() res: Response) {
    try {
      const [getWorkEmailEmployee, getPersonalEmailEmployee] = await Promise.all([
        this.employeesService.findOneByEmail(createDto.work_email),
        this.employeesService.findOneByEmail(createDto.personal_email)
      ]);      

      if(getWorkEmailEmployee || getPersonalEmailEmployee) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false, data: null, message: `Employee with this [${getWorkEmailEmployee ? 'Work Email' : 'Personal Email'}] already exists!`
        });
      }
      const [getDepartment, getJobTitle] = await Promise.all([
        this.empDepartmentsService.findOne(createDto.emp_department),
        this.empJobTitlesService.findOne(createDto.emp_job_title)
      ]);
      if(!getDepartment) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false, data: null, message: `Department with id ${createDto.emp_department} does not exist!`
        });
      }
      if(!getJobTitle) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false, data: null, message: `Job title with id ${createDto.emp_job_title} does not exist!`
        });
      }

      if (createDto.password) createDto.password = await bcrypt.hash(createDto.password, 10);
      else createDto.password = await bcrypt.hash('123456', 10); // Default password is 123456
      
      const createdEmployee = await this.employeesService.create(createDto);
      if(!createdEmployee) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false, data: null, message: 'Employee not created! Please try again later!'
        });
      }
      return res.status(HttpStatus.CREATED).json({
        success: true, data: createdEmployee, message: 'Employee created successfully!'
      });
    } catch (error) {
      console.error(error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false, data: null, message: 'Internal server error occurred. Please try again later!'
      });
    }
  }

  @Post('bulk-create')
  @ApiOperation({ summary: 'Bulk create employees' })
  @ApiBody({ type: [CreateEmployeeDto] })
  @ApiResponse({ status: 201, description: 'Employee created successfully.' })
  async bulkCreate(@Body() createDtos: CreateEmployeeDto[], @Res() res: Response) {
    try {
      // Validate input
      if (!Array.isArray(createDtos) || createDtos.length === 0) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false, data: null, message: 'Please provide an array of employees to create!'
        });
      }

      // Check for duplicate emails within the request
      const workEmails = createDtos.map(dto => dto.work_email);
      const personalEmails = createDtos.map(dto => dto.personal_email);
      const duplicateWorkEmail = workEmails.filter((email, index) => workEmails.indexOf(email) !== index);
      const duplicatePersonalEmail = personalEmails.filter((email, index) => personalEmails.indexOf(email) !== index);
      
      if (duplicateWorkEmail.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false, data: null, message: `Duplicate work email found: ${duplicateWorkEmail[0]}`
        });
      }
      
      if (duplicatePersonalEmail.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false, data: null, message: `Duplicate personal email found: ${duplicatePersonalEmail[0]}`
        });
      }

      // Check if emails already exist in database (batch check)
      const allEmails = [...workEmails, ...personalEmails];
      const existingEmployees = await this.employeesService.findByEmails(allEmails);
      
      if (existingEmployees.length > 0) {
        const existingEmail = allEmails.find(email => 
          existingEmployees.some(emp => emp.work_email === email || emp.personal_email === email)
        );
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false, data: null, message: `Employee with email ${existingEmail} already exists!`
        });
      }

      // Collect all unique department IDs and job title IDs
      const departmentIds = [...new Set(createDtos.map(dto => dto.emp_department))];
      const jobTitleIds = [...new Set(createDtos.map(dto => dto.emp_job_title))];

      // Batch validate departments and job titles
      const [departments, jobTitles] = await Promise.all([
        this.empDepartmentsService.findByIds(departmentIds),
        this.empJobTitlesService.findByIds(jobTitleIds)
      ]);

      // Check if all departments exist
      const foundDepartmentIds = departments.map(dept => dept.id);
      const missingDepartmentIds = departmentIds.filter(id => !foundDepartmentIds.includes(id));
      if (missingDepartmentIds.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false, data: null, message: `Department(s) with id(s) [${missingDepartmentIds.join(', ')}] do not exist!`
        });
      }

      // Check if all job titles exist
      const foundJobTitleIds = jobTitles.map(job => job.id);
      const missingJobTitleIds = jobTitleIds.filter(id => !foundJobTitleIds.includes(id));
      if (missingJobTitleIds.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false, data: null, message: `Job title(s) with id(s) [${missingJobTitleIds.join(', ')}] do not exist!`
        });
      }

      // Hash passwords for all employees
      const employeesToCreate = await Promise.all(createDtos.map(async (dto) => {
        const password = dto.password 
          ? await bcrypt.hash(dto.password, 10)
          : await bcrypt.hash('123456', 10); // Default password is 123456
        
        return {
          ...dto,
          password
        };
      }));

      // Bulk create employees
      const createdEmployees = await this.employeesService.bulkCreate(employeesToCreate);
      
      if (!createdEmployees || createdEmployees.length === 0) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false, data: null, message: 'Employees not created! Please try again later!'
        });
      }

      return res.status(HttpStatus.CREATED).json({
        success: true, data: createdEmployees, message: `${createdEmployees.length} employee(s) created successfully!`
      });
    } catch (error) {
      console.error(error);
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
