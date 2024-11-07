import { AuthGuard } from '@nestjs/passport';
import { UnauthorizedException } from '@nestjs/common';

//Проверка авторизован ли пользователь или нет
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info) {
    console.log('Отработал AuthGuard', user);

    if (err) {
      throw new UnauthorizedException(err.message);
    }

    if (info || !user) {
      throw new UnauthorizedException(info.message);
    }

    return user;
  }
}
