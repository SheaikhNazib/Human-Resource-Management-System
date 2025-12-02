import { Injectable } from '@nestjs/common';
import { TransactionalEmailsApi, SendSmtpEmail } from '@getbrevo/brevo';

@Injectable()
export class MailService {
  private readonly emailAPI: TransactionalEmailsApi;

  constructor() {
    this.emailAPI = new TransactionalEmailsApi();
    (this.emailAPI as any).authentications.apiKey.apiKey = process.env.BREVO_API_KEY;
  }

  async sendEmployeeCredentials(to: string, name: string, password: string) {
    const message = new SendSmtpEmail();
    message.subject = 'Your Employee Account Credentials';
    message.htmlContent = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f6f8fa; padding: 32px;">
        <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); padding: 32px 24px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <img src="https://hrm.tutorsplan.com/logo.png" alt="TutorsPlan Logo" style="height: 48px; margin-bottom: 8px;" onerror="this.style.display='none'" />
            <h2 style="color: #2d3748; margin: 0; font-size: 1.8rem;">Welcome to TutorsPlan!</h2>
          </div>
          <p style="font-size: 1.1rem; color: #444;">Hi <b>${name}</b>,</p>
          <p style="font-size: 1.05rem; color: #444;">Your employee account has been created. Please find your login credentials below:</p>
          <div style="background: #f1f5f9; border-radius: 6px; padding: 18px 20px; margin: 18px 0;">
            <p style="margin: 0 0 8px 0; font-size: 1.05rem;"><b>Email:</b> <span style="color: #2b6cb0;">${to}</span></p>
            <p style="margin: 0; font-size: 1.05rem;"><b>Password:</b> <span style="color: #2b6cb0;">${password}</span></p>
          </div>
          <div style="text-align: center; margin: 28px 0 18px 0;">
            <a href="https://hrm.tutorsplan.com/login" target="_blank" style="display: inline-block; background: #2b6cb0; color: #fff; text-decoration: none; padding: 12px 32px; border-radius: 5px; font-size: 1.1rem; font-weight: 500;">Login to your account</a>
          </div>
          <p style="font-size: 1rem; color: #666;">For security, please change your password after your first login.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 28px 0 16px 0;" />
          <p style="font-size: 0.95rem; color: #999; text-align: center;">If you have any questions, contact our HR team at <a href="mailto:${process.env.BREVO_DEFAULT_FROM || 'hr@yourcompany.com'}" style="color: #2b6cb0; text-decoration: none;">${process.env.BREVO_DEFAULT_FROM || 'hr@yourcompany.com'}</a>.</p>
        </div>
      </div>
    `;
    message.sender = { name: 'HR Team', email: process.env.BREVO_DEFAULT_FROM || 'hr@yourcompany.com' };
    message.to = [{ email: to, name }];
    try {
      await this.emailAPI.sendTransacEmail(message);
    } catch (error: any) {
      // Log the full error for debugging, handling any error shape
      if (error && typeof error === 'object') {
        if ('response' in error && error.response && 'body' in error.response) {
          console.error('Brevo sendTransacEmail error:', error.response.body);
        } else {
          console.error('Brevo sendTransacEmail error:', JSON.stringify(error, null, 2));
        }
      } else {
        console.error('Brevo sendTransacEmail error:', error);
      }
      throw error;
    }
  }
}
