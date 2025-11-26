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

@ApiTags('Users')
@UseGuards(JwtAuthGuard, RolesGuard)
@RequireRoles(Roles.SUPER_ADMIN)
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    @ApiOperation({ summary: 'Create user' })
    @ApiBody({ type: CreateUserDto })
    @ApiResponse({ status: 201, description: 'User created' })
    async create(@Body() createDto: CreateUserDto, @Res() res: Response) {
        try {
            const user = await this.usersService.findOneByEmailAndRole(createDto.email, createDto.role);
            if (user) {
                return res.status(HttpStatus.BAD_REQUEST).json({
                    success: false, data: null, message: 'User already exists!'
                });
            }
            createDto.password = await bcrypt.hash(createDto.password, 10);
            const createdUser = await this.usersService.create(createDto);
            return res.status(HttpStatus.CREATED).json({
                success: true, data: createdUser, message: 'User created successfully!'
            });
        }
        catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false, data: null, message: 'Internal server error occurred. Please try again later!'
            });
        }
    }

    @Get()
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
    @ApiOperation({ summary: 'Update user by id' })
    @ApiParam({ name: 'id', type: Number })
    @ApiBody({ type: UpdateUserDto })
    @ApiResponse({ status: 200, description: 'User updated' })
    async update(@Param('id') id: number, @Body() updateDto: UpdateUserDto, @Res() res: Response) {
        try {
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