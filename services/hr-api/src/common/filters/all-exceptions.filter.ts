import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Skip if response has already been sent by a specific filter
    if (response.headersSent || response.writableEnded) {
      return;
    }

    // Skip if exception is already handled by custom filters
    if (
      exception instanceof BadRequestException ||
      exception instanceof UnauthorizedException ||
      exception instanceof ForbiddenException ||
      exception instanceof NotFoundException
    ) {
      return; // Let the specific filters handle these
    }

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Error';
    let data = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const resObj = res as any;
        message = resObj.message || message;
        error = resObj.error || error;
        data = resObj.data || null;
      }
    }

    response.status(status).json({success: false, data: null, message});
  }
}
