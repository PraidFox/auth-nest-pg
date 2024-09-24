import {
  BaseEntity as _BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class BaseEntity extends _BaseEntity {
  //@ApiProperty()
  @PrimaryGeneratedColumn()
  @Column({ update: false })
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
