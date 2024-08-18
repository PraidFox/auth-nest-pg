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

  async verifyEmail(to: string, token: string) {
    await this.mailerService.sendMail({
      to,
      subject: 'Необходимо подтверждение почты',
      template: 'verification',
      context: {
        url: `http://localhost:3000/verify/${token}`,
        app_name: 'Наименование приложения',
        title: 'Спасибо за регистрацию, подтвердите свою почту.',
        actionTitle: 'Перейдите по ссылке для подтверждения почты',
      },
    });
    return 'email sent';
  }
}
