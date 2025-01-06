import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { BaseEntity } from '../../utils/base.entity';
import { ApiProperty } from '@nestjs/swagger';

//Лучше этого может быть ram
@Entity('sessions')
export class UserSessionEntity extends BaseEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @ManyToOne(() => UserEntity, (user) => user.sessions)
  user: UserEntity;

  @ApiProperty()
  @Column()
  sessionMetadata: string;
  //
  // @ApiProperty()
  // @Column({ nullable: true })
  // refreshToken: string;
}
