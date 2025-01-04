import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { MyError } from '../utils/constants/errors';
import { compare, genSalt, hash } from 'bcryptjs';
import { AuthDto, PasswordChangeDto, RegisterDto } from './dto/auth.dto';
import { JwtService } from '@nestjs/jwt';
import { DataAccessToken, DataAllTokens, DataRefreshToken } from '../utils/interfaces';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';
import { UserEntity } from '../users/entities/user.entity';
import { SessionService } from './session.service';
import { UserSessionEntity } from './entities/user-session.entity';
import { Request } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
    private readonly sessionService: SessionService,
  ) {}

  async register(registerDto: RegisterDto) {
    registerDto.password = await this.hashPassword(registerDto.password);

    const existUser: UserEntity = await this.userService.createUser(registerDto);
    await this.sendVerifyEmail(existUser.id);

    return existUser;
  }

  async sendVerifyEmail(userId: number) {
    const existUser: UserEntity = await this.userService.getUserById(userId);

    if (existUser.emailVerifiedAt) {
      throw new UnauthorizedException(MyError.VERIFICATION_EMAIL_ALREADY);
    }
    const verifyToken: string = await this.generateVerifyToken({
      id: existUser.id,
    });

    await this.emailService.verifyEmail(existUser.email, verifyToken);
  }

  async verifyEmail(userId: number) {
    const userEntity = await this.userService.getUserById(userId);
    if (userEntity) {
      if (userEntity.emailVerifiedAt == null) {
        userEntity.emailVerifiedAt = new Date();
        await userEntity.save();
      } else {
        throw new UnauthorizedException(MyError.VERIFICATION_EMAIL_ALREADY);
      }
    } else {
      throw new UnauthorizedException(MyError.VERIFICATION_FAILED);
    }
  }

  async login(dto: AuthDto, sessionMetadata: string) {
    const existUser = await this.userService.findUserEmailOrLogin(dto.emailOrLogin);
    const userWithPassword = await this.userService.getUserWithPassword(existUser.id);
    const isPasswordValid = await compare(dto.password, userWithPassword.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException(MyError.WRONG_IDENTIFICATION);
    }

    const { id, login } = existUser;
    const sessionInfo = await this.sessionService.setSession(id, sessionMetadata);

    const { accessToken, refreshToken } = await this.generateTokens({
      id,
      login,
      uuidSession: sessionInfo.id,
    });

    await this.sessionService.updateSession(sessionInfo.id, refreshToken);

    const { exp } = this.jwtService.decode(accessToken);

    return {
      token: accessToken,
      expire: new Date(exp * 1000),
      refreshToken: refreshToken,
      id: id,
    };
  }

  createMetadata(req: Request) {
    const userAgent: string = req.headers['user-agent'];
    const sec: string | string[] = req.headers['sec-ch-ua-platform'];
    const ip: string = req.ip;

    return userAgent + sec + ip;
  }

  async refresh({ id, login, uuidSession }: DataRefreshToken, sessionMetadata: string) {
    const session: UserSessionEntity = await this.sessionService.getSession(uuidSession);

    if (session.sessionMetadata != sessionMetadata) {
      throw new UnauthorizedException(MyError.TOKEN_COMPROMISED);
    }

    const { accessToken, refreshToken } = await this.generateTokens({ id, login, uuidSession });

    this.sessionService.updateSession(session.id, refreshToken);

    const { exp } = this.jwtService.decode(accessToken);

    return {
      token: accessToken,
      expire: new Date(exp * 1000),
      refreshToken: refreshToken,
    };
  }

  async sendMailResetPassword(emailOrLogin: string) {
    const existUser = await this.userService.findUserEmailOrLogin(emailOrLogin);
    const verifyToken = await this.generateVerifyToken({ id: existUser.id });
    await this.emailService.verifyResetPassword(existUser.email, verifyToken, existUser.id);
    return verifyToken;
  }

  async sendMailChangePassword(userId: number) {
    const existUser = await this.userService.getUserById(userId);
    const verifyToken = await this.generateVerifyToken({ id: existUser.id });
    await this.emailService.verifyResetPassword(existUser.email, verifyToken, existUser.id);
    return verifyToken;
  }

  async resetPassword(id: number, password: string) {
    const existUser = await this.userService.getUserById(id);
    const salt = await genSalt(10);
    const hashPassword = await hash(password, salt);
    await this.userService.updatePassword(existUser.id, hashPassword);
  }

  async saveTmpPassword(id: number, password: string) {
    const existUser = await this.userService.getUserById(id);
    const salt = await genSalt(10);
    const hashPassword = await hash(password, salt);
    await this.userService.updateTmpPassword(existUser.id, hashPassword);
  }

  async changePassword(id: number, dto: PasswordChangeDto) {
    const existUser = await this.userService.getUserById(id);
    const userWithPassword = await this.userService.getUserWithPassword(existUser.id);

    const isPasswordValid = await compare(dto.currentPassword, userWithPassword.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException(MyError.WRONG_IDENTIFICATION);
    }

    const salt = await genSalt(10);
    const hashPassword = await hash(dto.password, salt);
    await this.userService.updatePassword(existUser.id, hashPassword);
  }

  async generateVerifyToken({ id }: { id: number }) {
    return this.jwtService.signAsync(
      { id },
      {
        expiresIn: this.configService.get('jwt.expireVerify'),
      },
    );
  }

  private async hashPassword(password: string) {
    const salt = await genSalt(10);
    return await hash(password, salt);
  }

  private async generateTokens({ id, login, uuidSession }: DataAllTokens) {
    const accessToken = await this.generateAccessToken({ id, login });
    const refreshToken = await this.generateRefreshToken({ id, login, uuidSession });
    return { accessToken, refreshToken };
  }

  private async generateAccessToken({ id, login }: DataAccessToken) {
    return this.jwtService.signAsync(
      { id, login },
      {
        expiresIn: this.configService.get('jwt.expireAccess'),
      },
    );
  }

  private async generateRefreshToken({ id, login, uuidSession }: DataRefreshToken) {
    return this.jwtService.signAsync(
      { id, login, uuidSession },
      { expiresIn: this.configService.get('jwt.expireRefresh') },
    );
  }
}
