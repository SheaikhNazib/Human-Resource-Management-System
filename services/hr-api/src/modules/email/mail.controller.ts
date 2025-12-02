import { Controller, Post, Body, HttpStatus, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';
import { MailService } from './mail.service';
import { SendMailDto } from './dto/send-mail.dto';

@ApiTags('Mail')
@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('send-employee-credentials')
  @ApiOperation({ summary: 'Send employee credentials email' })
  @ApiBody({ type: SendMailDto })
  @ApiResponse({ status: 200, description: 'Email sent successfully.' })
  async sendEmployeeCredentials(@Body() body: SendMailDto, @Res() res: Response) {
    console.log('Received payload:', body);
    try {
      await this.mailService.sendEmployeeCredentials(body.to, body.name, body.password);
      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'Email sent successfully!'
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to send email',
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    }
  }
}
