import { AuthGuard } from '@nestjs/passport';
import { UnauthorizedException } from '@nestjs/common';
import { MyError } from '../../utils/constants/errors';

//Проверка авторизован ли пользователь или нет
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info) {
    if (err) {
      throw new UnauthorizedException(err.message);
    }

    if (info || !user) {
      throw new UnauthorizedException(info.message);
    }

    if (!user.id || !user.login) {
      throw new UnauthorizedException(MyError.FAIL_PARSE_TOKEN);
    }

    return user;
  }
}
