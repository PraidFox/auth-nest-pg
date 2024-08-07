import { AuthGuard } from '@nestjs/passport';

//TODO разобраться как отлавливать протухший токен самостоятельно, для выброса необходимого эксепшена
export class JwtAuthGuard extends AuthGuard('jwt') {}
