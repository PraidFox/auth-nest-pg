import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { MyError } from '../utils/constants/errors';
import { compare, genSalt, hash } from 'bcryptjs';
import { AuthDto, RegisterDto } from './dto/auth.dto';
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

  async login(dto: AuthDto) {
    const existUser = await this.userService.findUserEmailOrLogin(
      dto.emailOrLogin,
    );
    if (!existUser) {
      throw new UnauthorizedException(MyError.WRONG_IDENTIFICATION);
    }

    const userPassword = (await this.userService.getPassword(existUser.id))
      .password;
    const isPasswordValid = await compare(dto.password, userPassword);
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
    };
  }

  async verifyEmail(userId: number) {
    const userEntity = await this.userService.findUser({
      where: [{ id: userId }],
    });

    if (userEntity) {
      userEntity.emailVerifiedAt = new Date();
      await userEntity.save();
    } else {
      throw new UnauthorizedException(MyError.VERIFICATION_FAILED);
    }
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
  async verifyResetPassword(userId: number) {
    const userEntity = await this.userService.findUser({
      where: [{ id: userId }],
    });

    if (userEntity) {
      await userEntity.save();
    } else {
      throw new UnauthorizedException(MyError.VERIFICATION_FAILED);
    }
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
