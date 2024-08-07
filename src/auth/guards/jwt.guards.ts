import { AuthGuard } from '@nestjs/passport';
import { UnauthorizedException } from '@nestjs/common';

export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info) {
    if (err) {
      throw new UnauthorizedException(err.message);
    }

    if (info || !user) {
      throw new UnauthorizedException(info.message);
    }

    return user;
  }
}
