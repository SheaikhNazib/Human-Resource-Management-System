import { Injectable, CanActivate, ExecutionContext, ForbiddenException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { Roles } from './roles.enum';
import * as express from 'express';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Roles[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true;
    }
    
    const request = context.switchToHttp().getRequest<express.Request>();
    const response = context.switchToHttp().getResponse<express.Response>();
    const user = (request as any).user;
    
    if (!user) {
      response.status(HttpStatus.UNAUTHORIZED).json({
        success: false, data: null, message: 'Authentication required!',
      });
      return false;
    }

    if (!requiredRoles.includes(user.role)) {
      response.status(HttpStatus.FORBIDDEN).json({
        success: false, data: null, message: 'Permission denied!',
      });
      return false;
    }

    return true;
  }
}
