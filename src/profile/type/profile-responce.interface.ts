import { ProfileEntity } from '../entities/profile.entity';
import { UserEntity } from 'src/users/entities/user.entity';

export interface ProfileResponseInterface {
  user: UserEntity & { profile?:ProfileEntity, access_token:string, refresh_token:string };
}