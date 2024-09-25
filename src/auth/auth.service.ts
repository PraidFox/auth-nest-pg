import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { MyError } from '../utils/constants/errors';
import { compare, genSalt, hash } from 'bcryptjs';
import { AuthDto, RegisterDto } from './dto/auth.dto';
import { JwtService } from '@nestjs/jwt';
import { DataForToken } from '../utils/interfaces';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  async register(dto: RegisterDto) {
    const salt = await genSalt(10);
    dto.password = await hash(dto.password, salt);
    dto.tokenVerify = `${randomStringGenerator()}-${randomStringGenerator()}`;

    const user = await this.userService.createUser(dto);
    // await this.emailService.verifyEmail(user.email, user.tokenVerify);
    await this.emailService.verifyEmail(
      'hiryrg_94_94@mail.ru',
      user.tokenVerify,
      user.id,
    );

    return user;
  }

  async verify(token: string, userId: number) {
    const userEntity = await this.userService.findUser({
      where: [{ id: userId, tokenVerify: token }],
    });

    if (userEntity) {
      userEntity.tokenVerify = null;
      userEntity.emailVerifiedAt = new Date();
      await userEntity.save();
    } else {
      throw new UnauthorizedException(MyError.VERIFICATION_FAILED);
    }
  }

  async login(dto: AuthDto) {
    // const existUser = await this.userService.findUser({
    //   where: [{ login: dto.emailOrLogin }, { email: dto.emailOrLogin }],
    // });

    const existUser = await this.userService.findUserEmailOrLogin(
      dto.emailOrLogin,
    );

    if (!existUser) {
      throw new UnauthorizedException(MyError.WRONG_LOGIN);
    }

    const isPasswordValid = await compare(dto.password, existUser.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException(MyError.WRONG_LOGIN);
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

  async refresh(token: string) {
    try {
      const { id, login } = this.jwtService.verify(token);

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
    } catch (error) {
      throw new UnauthorizedException('Рефреш токен некорректный');
    }
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
}
