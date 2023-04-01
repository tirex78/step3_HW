import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
  UpdateDateColumn
} from 'typeorm';
import { FileEntity } from '../../files/entities/file.entity';


@Entity('text_block')
export class TextBlockEntity {
  @PrimaryGeneratedColumn()
  public id?: number;

  @Column()
  title: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  group: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'update_at', type: 'timestamp' })
  updatedAt: Date;

  @OneToMany(() => FileEntity, (file) => file.essenceId)
  images?: FileEntity[];

}