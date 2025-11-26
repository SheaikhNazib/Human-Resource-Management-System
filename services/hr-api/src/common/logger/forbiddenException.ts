import { ExceptionFilter, Catch, ArgumentsHost, ForbiddenException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch(ForbiddenException)
export class ForbiddenExceptionFilter implements ExceptionFilter {
    catch(exception: ForbiddenException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        response.status(HttpStatus.FORBIDDEN).json({
            success: false, data: null, 
            message: 'Forbidden! You are not authorized to access this resource!',
        });
    }
}