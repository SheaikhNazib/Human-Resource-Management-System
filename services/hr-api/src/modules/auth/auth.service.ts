import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { EmployeesService } from '../employees/employees.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private employeesService: EmployeesService,
    private jwtService: JwtService,
  ) {}

  async validateUser(userId: number) {
    return await this.usersService.findOne(userId);
  }

  async validateEmployee(userId: number) {
    return await this.employeesService.findOne(userId);
  }

  async validateUserByEmail(email: string) {
    return await this.usersService.findOneByEmail(email);
  }

  async validateEmployeeByEmail(email: string) {
    return await this.employeesService.findOneByEmail(email);
  }
}
