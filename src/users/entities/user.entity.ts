import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../utils/base.entity';

@Entity('users')
export class UserEntity extends BaseEntity {
  //TODO так как логин уникален, в ошибке на проверку есть ли уже такой пользователь, лучше выдавать ошибку что такой пользователь уже есть
  @Column({ unique: true })
  login: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  emailVerifiedAt: Date;
}
