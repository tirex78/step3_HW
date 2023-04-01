import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Repository, MoreThan, FindManyOptions } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ProfileEntity } from './entities/profile.entity';
import { AuthenticationService } from 'src/auth/auth.service';
import { UsersService } from 'src/users/users.service';
import { ProfileDto } from './dto/profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserEntity } from 'src/users/entities/user.entity';
import { ProfileResponseInterface } from './type/profile-responce.interface';


@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(ProfileEntity)
    private profileRepository: Repository<ProfileEntity>,
    private authenticationService: AuthenticationService,
    private usersService: UsersService
  ) { }

  // Create user with profile
  async signUp(
    signUpDto: ProfileDto
    ):Promise<ProfileResponseInterface> {
    const { user } = await this.authenticationService.register(signUpDto);

    if (user.id && signUpDto.profile) {
      const profileDto = {
        user_id: user.id,
        ...signUpDto.profile
      };
      const profile = await this.profileRepository.save(profileDto);
      profile.userId = undefined;
      return {
        user: {
          ...user,
          profile
          
        }
      };
    }
    return { user };
  }

  // Get all users with profile
  async getAllProfiles(
    offset?: number,
    limit?: number,
    startId?: number,
    options?: FindManyOptions<ProfileEntity>
    ):Promise<{items:ProfileEntity[], count:number}> {
    const where: FindManyOptions<ProfileEntity>['where'] = {};
    let separateCount = 0;
    if (startId) {
      where.id = MoreThan(startId);
      separateCount = await this.profileRepository.count();
    }

    const [items, count] = await this.profileRepository.findAndCount({
      where,
      order: {
        id: 'ASC',
      },
      skip: offset,
      take: limit,
      ...options,
    });
    return {
      items,
      count: startId ? separateCount : count,
    };
  }

  // Get profile by id
  async getById(
    userId: number
    ): Promise<{user:ProfileEntity & {userId:UserEntity}}> {
    const profile = await this.profileRepository.findOneBy({ user_id: userId });
    
    profile.user_id=undefined;

    if (profile) {
      return {
        user: {
          ...profile
        }
      };
    }
    throw new HttpException('User Profile with this id does not exist', HttpStatus.NOT_FOUND);

  }

  // Update Profile
  async updateProfile(
    userId: number, updateProfileDto: UpdateProfileDto
    ):Promise<{statusCode:number, message:string}> {

    if (updateProfileDto.profile) {
      await this.profileRepository.update({ user_id: userId }, updateProfileDto.profile);
      delete updateProfileDto.profile;
    }

    if (Object.keys(updateProfileDto).length !== 0) {
      await this.usersService.updateUser(userId, updateProfileDto);
    }

    return {
      statusCode: HttpStatus.OK,
      message: 'User Profile has been updated'
    };
  }

  // Delete profile
  async deleteProfile(
    userId: number
    ): Promise <{statusCode:number, message:string}> {
    await this.usersService.deleteUser(userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'User has removed'
    };
  }
}
