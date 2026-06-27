import { Injectable, Logger } from '@nestjs/common';

export interface IEmailService {
  sendVerificationEmail(email: string, token: string): Promise<boolean>;
  sendPasswordResetEmail(email: string, token: string): Promise<boolean>;
  sendJobNotificationEmail(email: string, jobType: string, downloadUrl: string): Promise<boolean>;
}

@Injectable()
export class EmailService implements IEmailService {
  private readonly logger = new Logger(EmailService.name);

  async sendVerificationEmail(email: string, token: string): Promise<boolean> {
    this.logger.log(`[Mock Email] Sending verification email to ${email}`);
    // Implement with Resend, SendGrid, or AWS SES
    return true;
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
    this.logger.log(`[Mock Email] Sending password reset email to ${email}`);
    return true;
  }

  async sendJobNotificationEmail(email: string, jobType: string, downloadUrl: string): Promise<boolean> {
    this.logger.log(`[Mock Email] Sending job complete notification to ${email} for job ${jobType}`);
    return true;
  }
}
