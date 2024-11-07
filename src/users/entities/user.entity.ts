import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../utils/base.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('users')
export class UserEntity extends BaseEntity {
  @ApiProperty()
  @Column({ unique: true })
  login: string;

  @ApiProperty()
  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @ApiProperty()
  @Column({ type: 'timestamp with time zone', nullable: true })
  emailVerifiedAt: Date;

  // @OneToMany(() => UserSessionEntity, (session) => session.user)
  // sessions: UserSessionEntity[];
}
