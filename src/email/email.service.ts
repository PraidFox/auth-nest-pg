import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}
  async sendEmail() {
    await this.mailerService.sendMail({
      to: 'hiryrg_94_94@mail.ru',
      subject: 'Thank You For Registration, Verify Your Account.',
      text: 'Другой текст',
      template: 'registration',
      context: {
        app_name: 'name',
        title: 'Thank You For Registration, Verify Your Account.',
        actionTitle: 'Verify Your Account',
      },
    });
    return 'email sent';
  }

  async verifyEmail({ to }) {
    await this.mailerService.sendMail({
      to: 'hiryrg_94_94@mail.ru',
      subject: 'Необходимо подтверждение почты',
      template: 'verification',
      context: {
        app_name: 'Наименование приложения',
        title: 'Thank You For Registration, Verify Your Account.',
        actionTitle: 'Verify Your Account',
      },
    });
    return 'email sent';
  }
}
