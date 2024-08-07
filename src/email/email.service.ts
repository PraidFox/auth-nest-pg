import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}
  async sendEmail() {
    await this.mailerService.sendMail({
      to: 'hiryrg_94_94@mail.ru'.toString(),
      subject: 'Thank You For Registration, Verify Your Account.',
      text: 'Другой текст',
    });
    return 'email sent';
  }
}
