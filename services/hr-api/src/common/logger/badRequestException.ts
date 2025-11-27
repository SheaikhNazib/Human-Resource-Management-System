import { ExceptionFilter, Catch, ArgumentsHost, BadRequestException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch(BadRequestException)
export class BadRequestExceptionFilter implements ExceptionFilter {
    catch(exception: BadRequestException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const responseBody = exception.getResponse();
        
        let message = 'Bad request!';
        if (typeof responseBody === 'string') {
            message = responseBody;
        } else if (typeof responseBody === 'object' && responseBody !== null) {
            const resObj = responseBody as any;
            if (resObj.message) {
                // Handle array of validation errors
                if (Array.isArray(resObj.message)) {
                    message = resObj.message.join(', ');
                } else {
                    message = resObj.message;
                }
            }
        }
        response.status(HttpStatus.BAD_REQUEST).json({ success: false, data: null, message });
    }
}
