import { Controller, Get, Post, Body, Param, Delete, Patch, UseGuards, Res, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { UsersService } from './users.service';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RequireRoles } from 'src/common/guards/roles.decorator';
import { Roles } from 'src/common/guards/roles.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { EmployeesService } from '../employees/employees.service';
import { EmpDepartmentsService } from '../emp_departments/emp_departments.service';
import { EmpJobTitlesService } from '../emp_job_titles/emp_job_titles.service';
import { createEmployeeObjectForUser } from '../employees/employees.function';

@ApiTags('Users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        private readonly employeesService: EmployeesService,
        private readonly empDepartmentsService: EmpDepartmentsService,
        private readonly empJobTitlesService: EmpJobTitlesService
    ) { }

    @Post()
    @RequireRoles(Roles.SUPER_ADMIN, Roles.HR_MANAGER, Roles.MANAGER)
    @ApiOperation({ summary: 'Create user' })
    @ApiBody({ type: CreateUserDto })
    @ApiResponse({ status: 201, description: 'User created' })
    async create(@Body() createDto: CreateUserDto, @Res() res: Response) {
        try {
            const [user, employee, department, jobTitle] = await Promise.all([
                this.usersService.findOneByEmail(createDto.email),
                this.employeesService.findOneByEmail(createDto.email),
                this.empDepartmentsService.findOne(createDto.emp_department),
                this.empJobTitlesService.findOne(createDto.emp_job_title)
            ]);
            if(employee) {
                return res.status(HttpStatus.BAD_REQUEST).json({
                    success: false, data: null, message: 'Email already exists as an employee!'
                });
            }
            if (user) {
                return res.status(HttpStatus.BAD_REQUEST).json({
                    success: false, data: null, message: 'Email already exists as a user!'
                });
            }
            if (!department) {
                return res.status(HttpStatus.BAD_REQUEST).json({
                    success: false, data: null, message: 'Department not found!'
                });
            }
            if (!jobTitle) {
                return res.status(HttpStatus.BAD_REQUEST).json({
                    success: false, data: null, message: 'Job title not found!'
                });
            }
            const employeeData = createEmployeeObjectForUser({ ...createDto, emp_department: department.id, emp_job_title: jobTitle.id });

            createDto.password = await bcrypt.hash(createDto.password, 10);
            const createdUser = await this.usersService.create(createDto);
            await this.employeesService.create(employeeData);

            return res.status(HttpStatus.CREATED).json({
                success: true, data: createdUser, message: 'User created successfully!'
            });
        }
        catch (error) {
            console.log('abc ========> ', error);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false, data: null, message: 'Internal server error occurred. Please try again later!'
            });
        }
    }

    @Get()
    @RequireRoles(Roles.SUPER_ADMIN, Roles.HR_MANAGER, Roles.MANAGER)
    @ApiOperation({ summary: 'Get all users' })
    @ApiResponse({ status: 200, description: 'List of users' })
    async findAll(@Res() res: Response) {
        try {
            const users = await this.usersService.findAll();
            return res.status(HttpStatus.OK).json({
                success: true, data: users, message: 'Users fetched successfully!'
            });
        }
        catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false, data: null, message: 'Internal server error occurred. Please try again later!'
            });
        }
    }

    @Get(':id')
    @RequireRoles(Roles.SUPER_ADMIN, Roles.HR_MANAGER, Roles.MANAGER)
    @ApiOperation({ summary: 'Get user by id' })
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 200, description: 'User found' })
    async findOne(@Param('id') id: number, @Res() res: Response) {
        try {
            const user = await this.usersService.findOne(id);
            if (!user) {
                return res.status(HttpStatus.NOT_FOUND).json({
                    success: false, data: null, message: 'User not found!'
                });
            }
            return res.status(HttpStatus.OK).json({
                success: true, data: user, message: 'User fetched successfully!'
            });
        }
        catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false, data: null, message: 'Internal server error occurred. Please try again later!'
            });
        }
    }

    @Patch(':id')
    @RequireRoles(Roles.SUPER_ADMIN, Roles.HR_MANAGER, Roles.MANAGER)
    @ApiOperation({ summary: 'Update user by id' })
    @ApiParam({ name: 'id', type: Number })
    @ApiBody({ type: UpdateUserDto })
    @ApiResponse({ status: 200, description: 'User updated' })
    async update(@Param('id') id: number, @Body() updateDto: UpdateUserDto, @Res() res: Response) {
        try {
            const user = await this.usersService.findOne(id);
            if(!user) {
                return res.status(HttpStatus.NOT_FOUND).json({
                    success: false, data: null, message: 'User not found!'
                });
            }
            if(updateDto.email && updateDto.email !== user.email) {
                const userByEmail = await this.usersService.findOneByEmail(updateDto.email);
                if(userByEmail) {
                    return res.status(HttpStatus.BAD_REQUEST).json({
                        success: false, data: null, message: 'User already exists!'
                    });
                }
            }
            if(updateDto.password) updateDto.password = await bcrypt.hash(updateDto.password, 10);
            
            const updatedUser = await this.usersService.update(id, updateDto);
            if (!updatedUser) {
                return res.status(HttpStatus.NOT_FOUND).json({
                    success: false, data: null, message: 'User not found!'
                });
            }
            return res.status(HttpStatus.OK).json({
                success: true, data: updatedUser, message: 'User updated successfully!'
            });
        }
        catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false, data: null, message: 'Internal server error occurred. Please try again later!'
            });
        }
    }

    @Delete(':id')
    @RequireRoles(Roles.SUPER_ADMIN)
    @ApiOperation({ summary: 'Delete user by id' })
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 200, description: 'User deleted' })
    async remove(@Param('id') id: number, @Res() res: Response) {
        try {
            const result = await this.usersService.remove(id);
            if (!result.affected || result.affected === 0) {
                return res.status(HttpStatus.NOT_FOUND).json({
                    success: false, data: null, message: 'User not found!'
                });
            }
            return res.status(HttpStatus.OK).json({
                success: true, data: null, message: 'User deleted successfully!'
            });
        }
        catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false, data: null, message: 'Internal server error occurred. Please try again later!'
            });
        }
    }
}