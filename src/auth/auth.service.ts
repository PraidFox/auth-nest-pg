import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { MyError } from '../utils/constants/errors';
import { compare } from 'bcryptjs';
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
    let user = await this.userService.findUserEmailOrLogin(registerDto.email);
    if (user) {
      throw new ConflictException(MyError.USER_ALREADY_EXISTS_EMAIL);
    }

    user = await this.userService.findUserEmailOrLogin(registerDto.login);
    if (user) {
      throw new ConflictException(MyError.USER_ALREADY_EXISTS_LOGIN);
    }
    return await this.userService.createUser(registerDto);
  }

  async sendVerifyEmail(user: UserEntity) {
    if (user.emailVerifiedAt) {
      throw new UnauthorizedException(MyError.VERIFICATION_EMAIL_ALREADY);
    }
    const verifyToken: string = await this.generateVerifyToken({
      id: user.id,
    });
    await this.emailService.verifyEmail(user.email, verifyToken);
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
    await this.emailService.verifyResetPassword(existUser.email, verifyToken);
    return verifyToken;
  }

  async sendMailChangePassword(userId: number) {
    const existUser = await this.userService.getUserById(userId);
    const verifyToken = await this.generateVerifyToken({ id: existUser.id });
    await this.emailService.verifyChangePassword(existUser.email, verifyToken);
    return verifyToken;
  }

  async resetPassword(id: number, password: string) {
    await this.userService.updatePassword(id, password);
  }

  async saveTmpPassword(id: number, dto: PasswordChangeDto) {
    const existUser = await this.userService.getUserById(id);

    await this.userService.updateTmpPassword(existUser, dto);
  }

  async changePassword(id: number) {
    const userWithPassword = await this.userService.getUserWithPassword(id);
    await this.userService.updatePassword(id, userWithPassword.tmpPassword);
  }

  async generateVerifyToken({ id }: { id: number }) {
    return this.jwtService.signAsync(
      { id },
      {
        expiresIn: this.configService.get('jwt.expireVerify'),
      },
    );
  }

  async checkToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      if (error.message == 'jwt expired') {
        throw new UnauthorizedException(MyError.TOKEN_EXPIRED);
      } else if (error.message == 'invalid token') {
        throw new UnauthorizedException(MyError.TOKEN_INVALID);
      } else if (error.message == 'jwt must be provided') {
        throw new UnauthorizedException(MyError.TOKEN_EMPTY);
      } else {
        throw new UnauthorizedException(error.message);
      }
    }
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
