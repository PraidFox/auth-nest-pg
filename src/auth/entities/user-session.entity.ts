import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';

//Лучше этого может быть ram
@Entity('sessions')
export class UserSessionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity, (user) => user.id)
  user: UserEntity;

  @Column()
  sessionMetadata: string;

  @Column()
  refreshToken: string;
}
