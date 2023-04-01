import { UserEntity } from '../entities/user.entity';

export interface UserResponseInterface {
  user: UserEntity & { access_token: string, refresh_token: string };
}