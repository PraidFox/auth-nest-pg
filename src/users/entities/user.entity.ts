import { Column, Entity } from 'typeorm';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../utils/base.entity';

@Entity('users')
export class UserEntity extends BaseEntity {
  @ApiProperty()
  @Column({ unique: true })
  login: string;

  @ApiProperty()
  @Column({ unique: true })
  email: string;

  @ApiProperty()
  @Column({ select: false })
  password: string;

  @ApiProperty()
  @Column({ select: false, nullable: true })
  tokenVerify: string;

  @ApiHideProperty()
  @Column({ type: 'timestamp with time zone', nullable: true })
  emailVerifiedAt: Date;

  // @ApiHideProperty()
  // @Column({ type: 'boolean', default: false })
  // isActive: boolean;
}
