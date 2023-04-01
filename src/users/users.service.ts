import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, FindManyOptions, Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) { }

  // Get user with pagination
  async getUsers(
    offset?: number,
    limit?: number,
    startId?: number,
    options?: FindManyOptions<UserEntity>,
  ):Promise<{items:UserEntity[], count:number}> {
    const where: FindManyOptions<UserEntity>['where'] = {};
    let separateCount = 0;
    if (startId) {
      where.id = MoreThan(startId);
      separateCount = await this.usersRepository.count();
    }

    const [items, count] = await this.usersRepository.findAndCount({
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

  // Get user by email
  async getByEmail(email: string):Promise<UserEntity> {
    const user = await this.usersRepository.findOneBy({ email });

    if (user) {
      return user;
    }
    throw new HttpException('User with this email does not exist', HttpStatus.NOT_FOUND,);
  }

  // Get user by id
  async getById(userId: number): Promise<UserEntity> {
    const user = await this.usersRepository.findOneBy({ id: userId });

    if (user) {
      return user;
    }
    throw new HttpException('User with this id does not exist', HttpStatus.NOT_FOUND,);
  }

  // Create user
  async createUser(createDto: CreateUserDto):Promise<UserEntity> {
    const newUser = this.usersRepository.create(createDto);
    await this.usersRepository.save(newUser);
    return newUser;
  }

  // Update user
  async updateUser(
    userId: number, updateUserDto: any
    ): Promise<{ statusCode: number, message: string }> {
    const result = await this.usersRepository.update(userId, updateUserDto);

    if (!result.affected) {
      throw new HttpException('User with this id was not found', HttpStatus.NOT_FOUND,);
    }

    return {
      statusCode: HttpStatus.OK,
      message: 'User has been updated'
    };
  }

  // Delete user
  async deleteUser(userId: number): Promise<{ statusCode: number, message: string }> {
    const result = await this.usersRepository.delete({ id: userId });

    if (!result.affected) {
      throw new HttpException('User with this id was not found', HttpStatus.NOT_FOUND,);
    }
    return {
      statusCode: HttpStatus.OK,
      message: 'User has been deleted'
    };
  }
}