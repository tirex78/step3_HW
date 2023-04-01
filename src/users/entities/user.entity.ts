import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Role } from '../role.enum';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  login: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: Role,
    array: true,
    default: [Role.User]
  })
  roles: Role[];

  @Column({ nullable: true })
  currentRefreshToken: string;
}