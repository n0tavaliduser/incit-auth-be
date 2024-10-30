import nodemailer from 'nodemailer';
import { User } from '../types/user';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendVerificationEmail(user: User, verificationToken: string): Promise<void> {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: user.email,
      subject: 'Verify your email address',
      html: `
        <h1>Email Verification</h1>
        <p>Hello ${user.name},</p>
        <p>Please click the button below to verify your email address:</p>
        <a href="${verificationUrl}" 
           style="background-color: #4A5568; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 4px; display: inline-block;">
          Verify Email
        </a>
        <p>Or copy and paste this link in your browser:</p>
        <p>${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }
}

export const emailService = new EmailService();