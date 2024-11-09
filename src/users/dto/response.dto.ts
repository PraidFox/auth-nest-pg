import { UserEntity } from '../entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

export class AllUser {
  @ApiProperty({ type: [UserEntity] })
  users: 'Всё что угодно';
  @ApiProperty()
  count: number;
}
