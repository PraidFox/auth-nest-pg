import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { getJwtConfig } from '../utils/constants/configs/jwt.config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { EmailModule } from '../email/email.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSessionEntity } from './entities/user-session.entity';
import { SessionService } from './session.service';
import { TokenService } from './token.service';

/**
 * Модуль auth - отвечает за авторизацию и аутентификацию пользователей.
 * Содержит следующие сервисы:
 * - auth - отвечает за авторизацию и аутентификацию пользователей.
 * - token - отвечает за работу с JWT-токенами.
 * - session - отвечает за работу с сессиями пользователей в базе данных.
 */

@Module({
  imports: [
    UsersModule,
    EmailModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getJwtConfig,
    }),
    TypeOrmModule.forFeature([UserSessionEntity]),
    PassportModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, SessionService, TokenService, JwtStrategy],
})
export class AuthModule {}
