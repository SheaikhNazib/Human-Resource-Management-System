import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(userId: number) {
    return await this.usersService.findOne(userId);
  }

  async validateUserByEmail(email: string) {
    return await this.usersService.findOneByEmail(email);
  }
}
