import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm/dist/interfaces/typeorm-options.interface';

export const getPostgresConfig = async (
  configService: ConfigService,
): Promise<TypeOrmModuleOptions> => {
  return {
    type: 'postgres',
    host: configService.get('db.host'),
    port: configService.get('db.port'),
    username: configService.get('db.user'),
    password: configService.get('db.password'),
    database: configService.get('db.name').toString(),
    entities: ['dist/**/*.entity{.ts,.js}'],
    synchronize: true,
    autoLoadEntities: true,
  };
};
