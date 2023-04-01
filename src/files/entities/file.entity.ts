import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  JoinTable,
} from 'typeorm';
import { TextBlockEntity } from '../../text-block/entities/text-block.entity';

@Entity('files')
export class FileEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  filename: string;

  @Column()
  path: string;

  @Column()
  mimetype: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @ManyToOne(() => TextBlockEntity, (textBlock) => textBlock.images)
  @JoinColumn({ name: 'essence_id' })
  essenceId: TextBlockEntity;

  @Column({ name: 'essence_table', nullable: true })
  essence: string;
}