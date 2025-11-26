import { Controller, Post, Body, HttpCode, HttpStatus, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { EmployeesService } from '../employees/employees.service';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';
import { Roles } from 'src/common/guards/roles.enum';
import { JwtService } from '@nestjs/jwt';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly employeesService: EmployeesService,
    private readonly jwtService: JwtService,
  ) { }

  @Post('login')
  @ApiBody({ type: LoginDto })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login & receive JWT token' })
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    try {
      const user = await this.employeesService.findOneByEmail(loginDto.work_email);
      if (!user) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false, data: null, message: 'User not found!'
        });
      }
      // const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
      // if (!isPasswordValid) {
      //   return res.status(HttpStatus.UNAUTHORIZED).json({
      //     success: false, data: null, message: 'Invalid credentials!'
      //   });
      // }
      const access_token = this.jwtService.sign({id: user.id, role: Roles.EMPLOYEE});
      const userResponse = {
        id: user.id,
        name: user.name,
        work_email: user.work_email
      };

      return res.status(HttpStatus.OK).json({
        success: true,
        data: { access_token, user: userResponse },
        message: 'Logged in successfully!'
      });
    } catch (error) {
      console.error(error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false, data: null, message: 'Internal server error occurred. Please try again later!'
      });
    }
  }
}
