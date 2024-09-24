import {
  BaseEntity as _BaseEntity,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class BaseEntity extends _BaseEntity {
  //@ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  //@ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  //@ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;

  //@ApiProperty()
  @DeleteDateColumn()
  deletedAt: Date;
}
