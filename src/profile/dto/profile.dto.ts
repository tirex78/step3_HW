import { IsEmail, IsString } from 'class-validator';
import { ProfileEntity } from '../entities/profile.entity';

export class ProfileDto {
  @IsString()
  login: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  profile?: ProfileEntity;
}
