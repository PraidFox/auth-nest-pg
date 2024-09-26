import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../utils/base.entity';

@Entity('users')
export class UserEntity extends BaseEntity {
  //@ApiProperty()
  @Column({ unique: true })
  login: string;

  //@ApiProperty()
  @Column({ unique: true })
  email: string;

  //@ApiProperty()
  @Column({ select: false })
  password: string;

  //@ApiProperty()
  @Column({ select: false, nullable: true })
  tokenVerifyEmail: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  whenSendTokenVerifyEmail: Date;

  //@ApiHideProperty()
  @Column({ type: 'timestamp with time zone', nullable: true })
  emailVerifiedAt: Date;

  //@ApiProperty()
  @Column({ select: false, nullable: true })
  tokenVerifyResetPassword: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  whenSendTokenResetPassword: Date;

  //@ApiHideProperty()
  @Column({ type: 'timestamp with time zone', nullable: true })
  resetPasswordVerifiedAt: Date;
}
