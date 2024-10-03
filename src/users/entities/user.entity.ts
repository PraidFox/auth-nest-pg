import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../utils/base.entity';

@Entity('users')
export class UserEntity extends BaseEntity {
  //@ApiProperty()
  //TODO так как логин уникален, в ошибке на проверку есть ли уже такой пользователь, лучше выдавать ошибку что такой пользователь уже есть
  @Column({ unique: true })
  login: string;

  //@ApiProperty()
  @Column({ unique: true })
  email: string;

  //@ApiProperty()
  @Column({ select: false })
  password: string;

  //@ApiHideProperty()
  @Column({ type: 'timestamp with time zone', nullable: true })
  emailVerifiedAt: Date;
}
