import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { BaseEntity } from '../../utils/base.entity';

export enum TokenType {
  REGISTER_VERIFY = 'REGISTER_VERIFY',
  RESET_PASSWORD = 'RESET_PASSWORD',
}
@Entity({ name: 'userTokens' })
export class Token extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  token: string;

  @Column({ type: 'boolean', default: false })
  isUsed: boolean;

  @Column({ type: 'enum', enum: TokenType })
  type: TokenType;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column()
  userId: number;

  @ManyToOne(() => UserEntity, (user) => user.id)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @BeforeInsert()
  async generateToken() {
    this.token = `${randomStringGenerator()}-${randomStringGenerator()}`;
  }
}
