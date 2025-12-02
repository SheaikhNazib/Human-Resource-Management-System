import { Controller, Get, Post, Body, Param, Delete, Patch, UseGuards, Query, Res, HttpStatus, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create.dto';
import { UpdateEmployeeDto } from './dto/update.dto';
import { QueryEmployeeDto } from './dto/query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';
import { EmpDepartmentsService } from '../emp_departments/emp_departments.service';
import { EmpJobTitlesService } from '../emp_job_titles/emp_job_titles.service';
import { RequireRoles } from '../../common/guards/roles.decorator';
import { Roles } from '../../common/guards/roles.enum';
import { MailService } from '../email/mail.service';
import { UsersService } from '../users/users.service';

@ApiTags('Employees')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
@Controller('employees')
export class EmployeesController {
  constructor(
    private readonly employeesService: EmployeesService,
    private readonly empDepartmentsService: EmpDepartmentsService,
    private readonly empJobTitlesService: EmpJobTitlesService,
    private readonly mailService: MailService,
    private readonly usersService: UsersService,
  ) { }

  @Post()
  @RequireRoles(Roles.SUPER_ADMIN, Roles.HR_MANAGER, Roles.MANAGER, Roles.ACCOUNTANT)
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

      let plainPassword = createDto.password;
      if (!plainPassword) {
        // Generate a random 10-character alphanumeric password using Math.random
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        plainPassword = Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
      }
      createDto.password = await bcrypt.hash(plainPassword, 10);

      const createdEmployee = await this.employeesService.create(createDto);
      if(!createdEmployee) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false, data: null, message: 'Employee not created! Please try again later!'
        });
      }

      // Send credentials email
      try {
        const employeeName = `${createDto.first_name || ''} ${createDto.last_name || ''}`.trim();
        await this.mailService.sendEmployeeCredentials(
          createDto.personal_email,
          employeeName,
          plainPassword
        );
      } catch (mailError) {
        console.error('Failed to send credentials email:', mailError);
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
  @RequireRoles(Roles.SUPER_ADMIN, Roles.HR_MANAGER, Roles.MANAGER, Roles.ACCOUNTANT)
  @ApiOperation({ summary: 'Bulk create employees' })
  @ApiBody({ type: [CreateEmployeeDto] })
  @ApiResponse({ status: 201, description: 'Employee created successfully.' })
  async bulkCreate(@Body() createDtos: CreateEmployeeDto[], @Res() res: Response) {
    try {
      if (!Array.isArray(createDtos) || createDtos.length === 0) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false, data: null, message: 'Please provide an array of employees to create!'
        });
      }
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

      const departmentIds = [...new Set(createDtos.map(dto => dto.emp_department))];
      const jobTitleIds = [...new Set(createDtos.map(dto => dto.emp_job_title))];

      const [departments, jobTitles] = await Promise.all([
        this.empDepartmentsService.findByIds(departmentIds),
        this.empJobTitlesService.findByIds(jobTitleIds)
      ]);

      const foundDepartmentIds = departments.map(dept => dept.id);
      const missingDepartmentIds = departmentIds.filter(id => !foundDepartmentIds.includes(id));
      if (missingDepartmentIds.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false, data: null, message: `Department(s) with id(s) [${missingDepartmentIds.join(', ')}] do not exist!`
        });
      }

      const foundJobTitleIds = jobTitles.map(job => job.id);
      const missingJobTitleIds = jobTitleIds.filter(id => !foundJobTitleIds.includes(id));
      if (missingJobTitleIds.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false, data: null, message: `Job title(s) with id(s) [${missingJobTitleIds.join(', ')}] do not exist!`
        });
      }

      const employeesToCreate = await Promise.all(createDtos.map(async (dto) => {
        const password = dto.password ? await bcrypt.hash(dto.password, 10) : await bcrypt.hash('123456', 10);
        return { ...dto, password };
      }));

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
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false, data: null, message: 'Internal server error occurred. Please try again later!'
      });
    }
  }

  // ==================== GET Endpoints ====================
  @Get()
  @RequireRoles(Roles.SUPER_ADMIN, Roles.HR_MANAGER, Roles.MANAGER, Roles.ACCOUNTANT, Roles.EMPLOYEE)
  @ApiOperation({ summary: 'Get all employees' })
  @ApiResponse({ status: 200, description: 'List of employees.' })
  async findAll(
    @Res() res: Response,
    @Query() query: QueryEmployeeDto
  ) {
    try {
      const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'asc', ...filters } = query;
      
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

  @Get('my-profile')
  @RequireRoles(Roles.EMPLOYEE, Roles.SUPER_ADMIN, Roles.HR_MANAGER, Roles.MANAGER, Roles.ACCOUNTANT)
  @ApiOperation({ summary: 'Get my profile' })
  @ApiResponse({ status: 200, description: 'Profile fetched successfully.' })
  async getMyProfile(@Req() req: any, @Res() res: Response) {
    try {
      const user = req.user;
      if (!user || !user.id) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          success: false, data: null, message: 'User not found in token!'
        });
      }

      // Only employees can view their own profile via this endpoint
      if (user.role !== Roles.EMPLOYEE) {
        return res.status(HttpStatus.FORBIDDEN).json({
          success: false, data: null, message: 'This endpoint is for employees only!'
        });
      }

      const employee = await this.employeesService.findOne(user.id);
      if (!employee) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false, data: null, message: 'Employee profile not found!'
        });
      }

      return res.status(HttpStatus.OK).json({
        success: true, data: employee, message: 'Profile fetched successfully!'
      });
    } catch (error) {
      console.error(error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false, data: null, message: 'Internal server error occurred. Please try again later!'
      });
    }
  }

  @Get(':id')
  @RequireRoles(Roles.SUPER_ADMIN, Roles.HR_MANAGER, Roles.MANAGER, Roles.ACCOUNTANT, Roles.EMPLOYEE)
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

  // ==================== PATCH Endpoints ====================
  @Patch('my-profile')
  @RequireRoles(Roles.EMPLOYEE, Roles.SUPER_ADMIN, Roles.HR_MANAGER, Roles.MANAGER, Roles.ACCOUNTANT)
  @ApiOperation({ summary: 'Update my profile' })
  @ApiBody({ type: UpdateEmployeeDto })
  @ApiResponse({ status: 200, description: 'Profile updated successfully.' })
  async updateMyProfile(@Req() req: any, @Body() updateDto: UpdateEmployeeDto, @Res() res: Response) {
    try {
      const user = req.user;
      if (!user || !user.id) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          success: false, data: null, message: 'User not found in token!'
        });
      }

      // Only employees can update their own profile via this endpoint
      if (user.role !== Roles.EMPLOYEE) {
        return res.status(HttpStatus.FORBIDDEN).json({
          success: false, data: null, message: 'This endpoint is for employees only!'
        });
      }

      // Filter out fields that employees shouldn't be able to update
      // Only allow updating: name, first_name, last_name, mobile, office_phone, address, full_address, password
      const filteredUpdateDto: Partial<UpdateEmployeeDto> = {};
      if (updateDto.name !== undefined) filteredUpdateDto.name = updateDto.name;
      if (updateDto.first_name !== undefined) filteredUpdateDto.first_name = updateDto.first_name;
      if (updateDto.last_name !== undefined) filteredUpdateDto.last_name = updateDto.last_name;
      if (updateDto.mobile !== undefined) filteredUpdateDto.mobile = updateDto.mobile;
      if (updateDto.office_phone !== undefined) filteredUpdateDto.office_phone = updateDto.office_phone;
      if (updateDto.address !== undefined) filteredUpdateDto.address = updateDto.address;
      if (updateDto.full_address !== undefined) filteredUpdateDto.full_address = updateDto.full_address;

      // Handle password update if provided
      let hashedPassword: string | undefined;
      if (updateDto.password) {
        hashedPassword = await bcrypt.hash(updateDto.password, 10);
        filteredUpdateDto.password = hashedPassword;
      }

      const updatedEmployee = await this.employeesService.update(user.id, filteredUpdateDto);
      if (!updatedEmployee || !updatedEmployee.data) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false, data: null, message: 'Employee profile not found!'
        });
      }

      // Update corresponding user entity if exists (by email match)
      try {
        const employee = updatedEmployee.data;
        // Check both work_email and personal_email to find matching user
        let existingUser = null;
        if (employee.work_email) {
          existingUser = await this.usersService.findOneByEmail(employee.work_email);
        }
        if (!existingUser && employee.personal_email) {
          existingUser = await this.usersService.findOneByEmail(employee.personal_email);
        }
        
        if (existingUser) {
          const userUpdateData: any = {};
          if (hashedPassword) {
            userUpdateData.password = hashedPassword;
          }
          if (Object.keys(userUpdateData).length > 0) {
            await this.usersService.update(existingUser.id, userUpdateData);
          }
        }
      } catch (userUpdateError) {
        console.error('Failed to update user entity:', userUpdateError);
        // Continue even if user update fails
      }

      return res.status(HttpStatus.OK).json({
        success: true, data: updatedEmployee.data, message: 'Profile updated successfully!'
      });
    } catch (error) {
      console.error(error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false, data: null, message: 'Internal server error occurred. Please try again later!'
      });
    }
  }

  @Patch(':id')
  @RequireRoles(Roles.SUPER_ADMIN, Roles.HR_MANAGER, Roles.MANAGER, Roles.ACCOUNTANT)
  @ApiOperation({ summary: 'Update employee' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateEmployeeDto })
  @ApiResponse({ status: 200, description: 'Employee updated successfully.' })
  async update(@Param('id') id: number, @Body() updateDto: UpdateEmployeeDto, @Res() res: Response) {
    try {
      // Handle password update if provided
      let hashedPassword: string | undefined;
      if (updateDto.password) {
        hashedPassword = await bcrypt.hash(updateDto.password, 10);
        updateDto.password = hashedPassword;
      }

      const updatedEmployee = await this.employeesService.update(id, updateDto);
      if (!updatedEmployee || !updatedEmployee.data) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false, data: null, message: 'Employee not found!'
        });
      }

      // Update corresponding user entity if exists (by email match)
      try {
        const employee = updatedEmployee.data;
        // Check both work_email and personal_email to find matching user
        let existingUser = null;
        if (employee.work_email) {
          existingUser = await this.usersService.findOneByEmail(employee.work_email);
        }
        if (!existingUser && employee.personal_email) {
          existingUser = await this.usersService.findOneByEmail(employee.personal_email);
        }
        
        if (existingUser) {
          const userUpdateData: any = {};
          if (hashedPassword) {
            userUpdateData.password = hashedPassword;
          }
          // Update user email if employee email was updated
          if (updateDto.work_email && existingUser.email !== updateDto.work_email) {
            userUpdateData.email = updateDto.work_email;
          } else if (updateDto.personal_email && existingUser.email !== updateDto.personal_email) {
            userUpdateData.email = updateDto.personal_email;
          }
          if (Object.keys(userUpdateData).length > 0) {
            await this.usersService.update(existingUser.id, userUpdateData);
          }
        }
      } catch (userUpdateError) {
        console.error('Failed to update user entity:', userUpdateError);
        // Continue even if user update fails
      }

      return res.status(HttpStatus.OK).json({
        success: true, data: updatedEmployee.data, message: 'Employee updated successfully!'
      });
    }
    catch (error) {
      console.error(error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false, data: null, message: 'Internal server error occurred. Please try again later!'
      });
    }
  }

  @Delete(':id')
  @RequireRoles(Roles.SUPER_ADMIN)
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
