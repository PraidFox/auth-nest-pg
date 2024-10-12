import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserSessionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: number;

  @Column()
  device: string;

  @Column()
  refreshToken: string;
}
