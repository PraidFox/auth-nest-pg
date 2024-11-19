import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { MyError } from '../utils/constants/errors';
import { compare, genSalt, hash } from 'bcryptjs';
import { AuthDto, PasswordChangeDto, RegisterDto } from './dto/auth.dto';
import { JwtService } from '@nestjs/jwt';
import { DataForToken } from '../utils/interfaces';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto) {
    const salt = await genSalt(10);
    registerDto.password = await hash(registerDto.password, salt);

    const existUser = await this.userService.createUser(registerDto);
    const verifyToken = await this.generateVerifyToken({ id: existUser.id });

    await this.emailService.verifyEmail(existUser.email, verifyToken);

    return existUser;
  }

  async verifyEmail(userId: number) {
    const userEntity = await this.userService.getUserById(userId);

    if (userEntity) {
      if (userEntity.emailVerifiedAt == null) {
        userEntity.emailVerifiedAt = new Date();
        await userEntity.save();
      }
    } else {
      throw new UnauthorizedException(MyError.VERIFICATION_FAILED);
    }
  }

  async login(dto: AuthDto) {
    const existUser = await this.userService.findUserEmailOrLogin(
      dto.emailOrLogin,
    );

    console.log('ver', existUser.emailVerifiedAt);

    if (!existUser) {
      throw new UnauthorizedException(MyError.WRONG_IDENTIFICATION);
    }

    const userWithPassword = await this.userService.getUserWithPassword(
      existUser.id,
    );

    const isPasswordValid = await compare(
      dto.password,
      userWithPassword.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException(MyError.WRONG_IDENTIFICATION);
    }

    const { id, login } = existUser;
    const { accessToken, refreshToken } = await this.generateTokens({
      id,
      login,
    });
    const { exp } = this.jwtService.decode(accessToken);

    return {
      token: accessToken,
      expire: new Date(exp * 1000),
      refreshToken: refreshToken,
      id: id,
    };
  }

  async sendMailResetPassword(emailOrLogin: string) {
    const existUser = await this.userService.findUserEmailOrLogin(emailOrLogin);
    if (!existUser) {
      throw new UnauthorizedException(MyError.WRONG_IDENTIFICATION);
    }

    const verifyToken = await this.generateVerifyToken({ id: existUser.id });

    await this.emailService.verifyResetPassword(
      existUser.email,
      verifyToken,
      existUser.id,
    );
  }

  async resetPassword(id: number, password: string) {
    const existUser = await this.userService.getUserById(id);
    const salt = await genSalt(10);
    const hashPassword = await hash(password, salt);
    await this.userService.updatePassword(existUser.id, hashPassword);
  }

  async changePassword(id: number, dto: PasswordChangeDto) {
    const existUser = await this.userService.getUserById(id);
    const userWithPassword = await this.userService.getUserWithPassword(
      existUser.id,
    );

    const isPasswordValid = await compare(
      dto.currentPassword,
      userWithPassword.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException(MyError.WRONG_IDENTIFICATION);
    }

    const salt = await genSalt(10);
    const hashPassword = await hash(dto.password, salt);
    await this.userService.updatePassword(existUser.id, hashPassword);
  }

  async refresh({ id, login }: DataForToken) {
    const { accessToken, refreshToken } = await this.generateTokens({
      id,
      login,
    });
    const { exp } = this.jwtService.decode(accessToken);

    return {
      token: accessToken,
      expire: new Date(exp * 1000),
      refreshToken: refreshToken,
    };
  }

  private async generateTokens({ id, login }: DataForToken) {
    const accessToken = await this.generateAccessToken({ id, login });
    const refreshToken = await this.generateRefreshToken({ id, login });
    return { accessToken, refreshToken };
  }

  private async generateAccessToken({ id, login }: DataForToken) {
    return this.jwtService.signAsync(
      { id, login },
      {
        expiresIn: this.configService.get('jwt.expireAccess'),
      },
    );
  }

  private async generateRefreshToken({ id, login }: DataForToken) {
    return this.jwtService.signAsync(
      { id, login },
      { expiresIn: this.configService.get('jwt.expireRefresh') },
    );
  }

  private async generateVerifyToken({ id }: { id: number }) {
    return this.jwtService.signAsync(
      { id },
      {
        expiresIn: this.configService.get('jwt.expireVerify'),
      },
    );
  }
}
