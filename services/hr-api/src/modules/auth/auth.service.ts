import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { EmployeesService } from '../employees/employees.service';
import { Roles } from 'src/common/guards/roles.enum';

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

  async validateUserByEmailAndRole(email: string, role: Roles) {
    return await this.usersService.findOneByEmailAndRole(email, role);
  }

  async validateEmployeeByEmail(email: string) {
    return await this.employeesService.findOneByEmail(email);
  }
}
