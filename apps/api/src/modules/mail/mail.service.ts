import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

/** Escapes text for safe interpolation into an HTML email body. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private from = 'noreply@vendorslk.com';

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const host = this.config.get<string>('mail.host');
    if (!host) {
      this.logger.warn('SMTP not configured — email notifications disabled');
      return;
    }

    this.from = this.config.get<string>('mail.from') ?? this.from;
    this.transporter = nodemailer.createTransport({
      host,
      port: this.config.get<number>('mail.port') ?? 587,
      secure: false,
      auth: {
        user: this.config.get<string>('mail.user'),
        pass: this.config.get<string>('mail.pass'),
      },
    });

    this.logger.log(`SMTP configured (${host})`);
  }

  async sendInquiryNotification(opts: {
    vendorEmail: string;
    vendorName: string;
    inquirerName: string;
    inquirerEmail: string;
    inquirerPhone: string;
    eventDate: string | null;
    message: string;
  }): Promise<void> {
    if (!this.transporter) return;

    const vendorName = escapeHtml(opts.vendorName);
    const inquirerName = escapeHtml(opts.inquirerName);
    const inquirerEmail = escapeHtml(opts.inquirerEmail);
    const inquirerPhone = escapeHtml(opts.inquirerPhone);
    const message = escapeHtml(opts.message).replace(/\n/g, '<br>');

    const dateLine = opts.eventDate
      ? `<p><strong>Event date:</strong> ${escapeHtml(new Date(opts.eventDate).toLocaleDateString())}</p>`
      : '';

    try {
      await this.transporter.sendMail({
        from: this.from,
        to: opts.vendorEmail,
        subject: `New inquiry from ${opts.inquirerName.replace(/[\r\n]/g, ' ')} — VendorsLK`,
        html: `
          <h2>New inquiry for ${vendorName}</h2>
          <p><strong>From:</strong> ${inquirerName} (${inquirerEmail})</p>
          <p><strong>Phone:</strong> ${inquirerPhone}</p>
          ${dateLine}
          <p><strong>Message:</strong></p>
          <blockquote style="border-left:3px solid #e5e7eb;padding-left:12px;color:#374151">
            ${message}
          </blockquote>
          <p style="color:#6b7280;font-size:13px">
            Log in to <a href="https://vendorslk.com/dashboard/vendor/inquiries">your dashboard</a> to respond.
          </p>
        `,
      });
    } catch (err) {
      this.logger.error('Failed to send inquiry notification', err);
    }
  }
}
