import { Exclude } from 'class-transformer';
import { Column, JoinColumn, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';

@Entity('profiles')
export class ProfileEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  phone: string;

  @OneToOne(() => UserEntity,
    {
      eager: true,
      cascade: true,
      onDelete: 'CASCADE'
    }
  )
  @JoinColumn({ name: 'user_id' })
  userId: UserEntity;

  @Column()
  @Exclude()
  user_id: number;
}

