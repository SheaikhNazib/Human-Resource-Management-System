import { Controller, Post, Body, HttpCode, HttpStatus, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { EmployeesService } from '../employees/employees.service';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';
import { Roles } from 'src/common/guards/roles.enum';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { Users } from 'src/models/user.entity';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly employeesService: EmployeesService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) { }

  @Post('login')
  @ApiBody({ type: LoginDto })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login & receive JWT token' })
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    try {
      let user: any;
      if (loginDto.role !== Roles.EMPLOYEE) {
        user = await this.usersService.findOneByEmail(loginDto.email);
        if (!user) {
          return res.status(HttpStatus.NOT_FOUND).json({
            success: false, data: null, message: 'User not found!'
          });
        }
      } else {
        user = await this.employeesService.findOneByEmail(loginDto.email);
        if (!user) {
          return res.status(HttpStatus.NOT_FOUND).json({
            success: false, data: null, message: 'Employee not found!'
          });
        }
      }
      const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
      if (!isPasswordValid) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          success: false, data: null, message: 'Invalid credentials!'
        });
      } 
      const access_token = this.jwtService.sign({ id: user.id, role: loginDto.role });
      const userResponse = {
        id: user.id,
        email: user.email,
        role: user.role
      };
      return res.status(HttpStatus.OK).json({
        success: true, data: { access_token, user: userResponse }, message: 'Logged in successfully!'
      });

    } catch (error) {
      console.error(error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false, data: null, message: 'Internal server error occurred. Please try again later!'
      });
    }
  }
}
