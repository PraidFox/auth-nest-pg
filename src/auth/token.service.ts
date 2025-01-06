import { Injectable, UnauthorizedException } from '@nestjs/common';
import { MyError } from '../utils/constants/errors';
import { DataAccessToken, DataAllTokens, DataRefreshToken } from '../utils/interfaces';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  decodeToken<T>(token: string): T {
    return this.jwtService.decode(token);
  }

  async generateVerifyToken({ id }: { id: number }) {
    return this.jwtService.signAsync(
      { id },
      {
        expiresIn: this.configService.get('jwt.expireVerify'),
      },
    );
  }

  checkToken(token: string) {
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

  async generateTokens({ id, login, uuidSession }: DataAllTokens) {
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
