import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

export const getJwtConfig = async (
  configService: ConfigService,
): Promise<JwtModuleOptions> => {
  return {
    secret: configService.get('jwt.secret'),
    // signOptions: {
    //   expiresIn: configService.get('jwt.expireAccess'),
    // },
  };
};
