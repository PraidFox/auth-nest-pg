import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}
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

  async verifyEmail(to: string, token: string, userId: number) {
    await this.mailerService.sendMail({
      to,
      subject: 'Необходимо подтверждение почты',
      template: 'verificationEmail',
      context: {
        url: `${this.configService.get('url')}:${this.configService.get('port')}/api/auth/verify?token=${token}&userId=${userId}`,
        app_name: 'Наименование приложения',
        title: 'Спасибо за регистрацию, подтвердите свою почту.',
        actionTitle: 'Перейдите по ссылке для подтверждения почты',
      },
    });
    return 'email sent';
  }

  async verifyResetPassword(to: string, token: string, userId: number) {
    await this.mailerService.sendMail({
      to,
      subject: 'Необходимо подтвердить смену пароля',
      template: 'verification',
      context: {
        url: `${this.configService.get('url')}:${this.configService.get('port')}/api/auth/verify?token=${token}&userId=${userId}`,
        app_name: 'Наименование приложения',
        title: 'Спасибо за регистрацию, подтвердите свою почту.',
        actionTitle: 'Перейдите по ссылке для подтверждения почты',
      },
    });
    return 'email sent';
  }
}
