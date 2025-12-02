import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';
import { Roles } from '../../common/guards/roles.enum';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: '@!$#@!**@#$%^&*()_+',
    });
  }

  async validate(payload: any) {
    console.log(payload);
    const userId = payload.id || payload.sub;
    const role = payload.role;
    
    let user: any;
    
    // Role jodi employee hoy, tahole employees table theke check korbo
    // Ar baki sob roles er jonno users table theke check korbo
    if (role === Roles.EMPLOYEE) {
      user = await this.authService.validateEmployee(userId);
    } else {
      user = await this.authService.validateUser(userId);
    }
    
    if (!user) {
      throw new UnauthorizedException();
    }

    // Employee table e email field alada, tai email handle korbo
    const email = user.email || user.work_email || user.personal_email;

    return {
      id: user.id,
      email: email,
      role: user.role || payload.role,
    };
  }
}
