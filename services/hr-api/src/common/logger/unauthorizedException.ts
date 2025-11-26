import { ExceptionFilter, Catch, ArgumentsHost, UnauthorizedException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch(UnauthorizedException)
export class UnauthorizedExceptionFilter implements ExceptionFilter {
    catch(exception: UnauthorizedException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        response.status(HttpStatus.UNAUTHORIZED).json({
            success: false, data: null, message: 'Unauthorized. Token is missing or invalid!',
        });
    }
}