import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { MyError } from '../utils/constants/errors';
import { compare, genSalt, hash } from 'bcryptjs';
import { AuthDto, RegisterDto } from './dto/auth.dto';
import { JwtService } from '@nestjs/jwt';
import { DataForToken } from '../utils/interfaces';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private async;

  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const salt = await genSalt(10);
    dto.password = await hash(dto.password, salt);

    return this.userService.createUser(dto);
  }

  async login(dto: AuthDto) {
    const existUser = await this.userService.findUserWithPassword(
      dto.emailOrLogin,
    );
    const isPasswordEquals = await compare(dto.password, existUser.password);

    if (!existUser || !isPasswordEquals) {
      throw new UnauthorizedException(MyError.WRONG_PASSWORD);
    }

    const { id, login } = existUser;

    const accessToken = await this.generateAccessToken({ id, login });
    const refreshToken = await this.generateRefreshToken({ id, login });

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

      const accessToken = await this.generateAccessToken({ id, login });
      const refreshToken = await this.generateRefreshToken({ id, login });

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
