import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import configurations from './utils/constants/configs/env.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { getPostgresConfig } from './utils/constants/configs/postgres.config';
import { EmailModule } from './email/email.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailerConfigClass } from './utils/constants/configs/mail.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configurations],
    }),
    TypeOrmModule.forRootAsync({
      imports: [],
      inject: [ConfigService],
      useFactory: getPostgresConfig,
    }),
    MailerModule.forRootAsync({
      imports: [],
      useClass: MailerConfigClass,
    }),
    UsersModule,
    AuthModule,
    EmailModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
