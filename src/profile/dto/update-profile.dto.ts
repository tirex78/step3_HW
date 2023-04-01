import { IsEmail, IsString } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  login?: string;

  @IsEmail()
  email?: string;

  @IsString()
  roles?: string;

  profile?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
  };
}