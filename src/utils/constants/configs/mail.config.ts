import { MailerOptions, MailerOptionsFactory } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailerConfigClass implements MailerOptionsFactory {
  constructor(private configService: ConfigService) {}

  createMailerOptions(): MailerOptions {
    return {
      transport: {
        host: this.configService.get('mail.host'),
        port: this.configService.get('mail.port'),
        secure: true,
        auth: {
          user: this.configService.get('mail.user'),
          pass: this.configService.get('mail.password'),
        },
      },
      defaults: {
        from: '"Your Name" <kvestha@mail.ru>',
      },
      // template: {
      //   dir: path.join(
      //     this.configService.get('app.workingDirectory'),
      //     'src',
      //     'modules',
      //     'mail',
      //     'templates',
      //   ),
      //   adapter: new HandlebarsAdapter(),
      //   options: {
      //     strict: true,
      //   },
      // },
    };
  }
}
