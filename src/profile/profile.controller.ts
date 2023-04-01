import { 
  Controller, 
  HttpCode, 
  HttpStatus, 
  UseGuards, 
  Body, 
  Param, 
  Post, 
  Get, 
  Patch, 
  Delete,
  Query 
  } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { Public } from '../auth/decorators/public.decorator';
import { RoleGuard } from '../users/guard/role.guard';
import { Role } from '../users/role.enum';
import { GetCurrentUser } from '../auth/decorators/get-current-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileResponseInterface } from './type/profile-responce.interface';
import { PaginationParams } from 'src/utils/pagination-params';
import { ProfileEntity } from './entities/profile.entity';
import { UserEntity } from 'src/users/entities/user.entity';

@Controller('')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) { }

  // Create new user with profile
  @Public()
  @Post('auth/signUp')
  @HttpCode(HttpStatus.CREATED)
  async signUp(
    @Body() signUpDto: any
  ): Promise<ProfileResponseInterface> {
    return await this.profileService.signUp(signUpDto);
  }

  // USER
  // Get current user
  @UseGuards(RoleGuard(Role.User))
  @Get('profile/me')
  async getMyProfile(
    @GetCurrentUser('sub') userId: number
  ): Promise<{user:ProfileEntity & {userId:UserEntity}}> {
    const profile = await this.profileService.getById(userId);
    return profile;
  }

  // Update Me
  @UseGuards(RoleGuard(Role.User))
  @Patch('profile/me')
  async updateMe(
    @GetCurrentUser('sub') userId: number,
    @Body() updateUserDto: UpdateProfileDto,
  ): Promise<{statusCode:number, message:string}> {
    return this.profileService.updateProfile(userId, updateUserDto);
  }

  // Delete Me
  @UseGuards(RoleGuard(Role.User))
  @Delete('profile/me')
  async deleteMe(
    @GetCurrentUser('sub') userId: number,
  ): Promise<{statusCode:number, message:string}> {
    return this.profileService.deleteProfile(userId);
  }

  // ADMIN
  // Get all profiles
  @UseGuards(RoleGuard(Role.Admin))
  @Get('profile')
  async getAllProfiles(
    @Query() { offset, limit, startId, ...options }: PaginationParams,
  ): Promise<{ items: ProfileEntity[], count: number }> {
    const res = await this.profileService.getAllProfiles(offset, limit, startId, options);
    return res;
  }


  // Get profile by id
  @UseGuards(RoleGuard(Role.Admin))
  @Get('profile/:userId')
  async getProfileById(@Param('userId') userId: number)
  : Promise<{user:ProfileEntity & {userId:UserEntity}}> {
    return this.profileService.getById(userId);
  }

  // Update profile
  @UseGuards(RoleGuard(Role.Admin))
  @Patch('profile/:userId')
  async updateProfile(
    @Param('userId') userId: number,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<{statusCode:number, message:string}> {
    const res = await this.profileService.updateProfile(userId, updateProfileDto);
    return res;
  }

  // Delete profile
  @UseGuards(RoleGuard(Role.Admin))
  @Delete('profile/:userId')
  async deleteProfile(
    @Param('userId') userId: number
  ): Promise<{statusCode:number, message:string}> {
    const res = await this.profileService.deleteProfile(userId);
    return res;
  }
}
