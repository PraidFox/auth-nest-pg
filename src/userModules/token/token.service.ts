import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateToken(user: any) {
    // const payload = { username: user.username, sub: user.id };
    const payload = { user };

    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('jwt.secret'),
      expiresIn: this.configService.get('jwt.expire'),
    });

    const { exp } = this.jwtService.decode(token);

    return {
      token,
      expirationTime: new Date(exp * 1000),
    };
  }
}
