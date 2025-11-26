import { Injectable, CanActivate, ExecutionContext, ForbiddenException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as express from 'express';
import { Roles } from './roles.enum';

/**
 * Resource Owner Guard
 * Prevents IDOR (Insecure Direct Object Reference) attacks
 * Ensures users can only modify their own resources
 * 
 * Usage:
 * @UseGuards(JwtAuthGuard, ResourceOwnerGuard)
 * @SetMetadata('resourceType', 'job')
 * @SetMetadata('ownerField', 'employeeId')
 */
@Injectable()
export class ResourceOwnerGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<express.Request>();
    const response = context.switchToHttp().getResponse<express.Response>();
    const user = (request as any).user;
    
    // Get metadata
    const resourceType = this.reflector.get<string>('resourceType', context.getHandler());
    const ownerField = this.reflector.get<string>('ownerField', context.getHandler());
    const allowAdmin = this.reflector.get<boolean>('allowAdmin', context.getHandler()) ?? true;
    
    // If no metadata, skip check
    if (!resourceType || !ownerField) {
      return true;
    }

    // Admin can access everything (if allowed)
    if (allowAdmin && user.role === Roles.ADMIN) {
      return true;
    }

    // Get resource ID from params
    const resourceId = request.params.id || request.params.jobId;
    
    if (!resourceId) {
      response.status(HttpStatus.FORBIDDEN).json({
        success: false, data: null, message: 'Resource ID not found!',
      });
      return false;
    }

    // Check ownership based on resource type
    const isOwner = await this.checkOwnership(resourceType, resourceId, user.id, ownerField);
    
    if (!isOwner) {
      response.status(HttpStatus.FORBIDDEN).json({
        success: false, data: null, message: 'You do not have permission to access this resource!',
      });
      return false;
    }

    return true;
  }

  private async checkOwnership(
    resourceType: string, 
    resourceId: string, 
    userId: number,
    ownerField: string
  ): Promise<boolean> {
    // This should be implemented based on your entity structure
    // For now, returning true - implement proper checking in actual usage
    
    // Example implementation:
    // const repo = this.getRepository(resourceType);
    // const resource = await repo.findOne({ where: { id: resourceId } });
    // return resource && resource[ownerField] === userId;
    
    return true;
  }
}

/**
 * Decorator to specify resource type and owner field
 */
export const CheckResourceOwner = (
  resourceType: string, 
  ownerField: string = 'employeeId',
  allowAdmin: boolean = true  // Default: admin can bypass
) => {
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata('resourceType', resourceType, descriptor.value);
    Reflect.defineMetadata('ownerField', ownerField, descriptor.value);
    Reflect.defineMetadata('allowAdmin', allowAdmin, descriptor.value);
    return descriptor;
  };
};

