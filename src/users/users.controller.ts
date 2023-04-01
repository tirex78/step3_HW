import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { RoleGuard } from './guard/role.guard';
import { Role } from './role.enum';
import { GetCurrentUser } from '../auth/decorators/get-current-user.decorator';
import { UserEntity } from './entities/user.entity';
import { PaginationParams } from '../utils/pagination-params';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  // USER
  // Get current user
  @UseGuards(RoleGuard(Role.User))
  @Get('me')
  async getMe(
    @GetCurrentUser('sub') userId: number
  ): Promise<UserEntity> {
    return this.usersService.getById(userId);
  }

  // Update current user
  @UseGuards(RoleGuard(Role.User))
  @Patch('me')
  async updateMe(
    @GetCurrentUser('sub') userId: number,
    @Body() updateUserDto: UserEntity,
  ): Promise<{ statusCode: number, message: string }> {
    return this.usersService.updateUser(userId, updateUserDto);
  }

  // Delete curremt user
  @UseGuards(RoleGuard(Role.User))
  @Delete('me')
  async delete(
    @GetCurrentUser('sub') userId: number,
  ): Promise<{ statusCode: number, message: string }> {
    return this.usersService.deleteUser(userId);
  }

  // ADMIN
  // Get all users
  @UseGuards(RoleGuard(Role.Admin))
  @Get()
  async findAllUser(
    @Query() { offset, limit, startId, ...options }: PaginationParams,
  ): Promise<{ items: UserEntity[], count: number }> {
    const res = await this.usersService.getUsers(offset, limit, startId, options);
    return res;
  }

  // Get user by id
  @UseGuards(RoleGuard(Role.Admin))
  @Get(':userId')
  async getPostById(@Param('userId') userId: number): Promise<UserEntity> {
    return this.usersService.getById(userId);
  }

  // Update user by id
  @UseGuards(RoleGuard(Role.Admin))
  @Patch(':userId')
  async updatePost(
    @Param('userId') userId: number,
    @Body() updateUserDto: UserEntity,
  ): Promise<{ statusCode: number, message: string }> {
    const res = await this.usersService.updateUser(userId, updateUserDto);
    return res;
  }

  // Delete user by id
  @UseGuards(RoleGuard(Role.Admin))
  @Delete(':userId')
  async deleteuser(@Param('userId') userId: number): Promise<{ statusCode: number, message: string }> {
    const res = await this.usersService.deleteUser(userId);
    return res;
  }
}