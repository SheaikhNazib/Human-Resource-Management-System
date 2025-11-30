import { Injectable, CanActivate, ExecutionContext, ForbiddenException, HttpStatus } from '@nestjs/common';
import { Reflector, ModuleRef } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { Roles } from './roles.enum';
import { UsersService } from '../../modules/users/users.service';
import { EmployeesService } from '../../modules/employees/employees.service';
import * as express from 'express';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private moduleRef: ModuleRef,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
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

    const userRole = user.role;
    if (!userRole) {
      response.status(HttpStatus.UNAUTHORIZED).json({
        success: false, data: null, message: 'Role not found in token!',
      });
      return false;
    }

    let userExists = false;
    if (userRole === Roles.EMPLOYEE) {
      const employeesService = this.moduleRef.get(EmployeesService, { strict: false });
      const employee = await employeesService.findOne(user.id);
      userExists = !!employee;
    } else {
      const usersService = this.moduleRef.get(UsersService, { strict: false });
      const userRecord = await usersService.findOne(user.id);
      userExists = !!userRecord;
    }

    if (!userExists) {
      response.status(HttpStatus.UNAUTHORIZED).json({
        success: false, data: null, message: 'User not found in database!',
      });
      return false;
    }

    // Required role check
    if (!requiredRoles.includes(userRole)) {
      response.status(HttpStatus.FORBIDDEN).json({
        success: false, data: null, message: 'Permission denied!',
      });
      return false;
    }

    return true;
  }
}
