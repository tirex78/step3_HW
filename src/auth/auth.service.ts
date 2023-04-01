import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import PostgresErrorCode from '../database/postgres-error-codes.enum';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LogInDto } from './dto/login.dto';
import { UserResponseInterface } from 'src/users/type/user-responce.interface';
import { Tokens } from './type/tokens.type';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) { }

  // Create user
  async register(
    registrationData: RegisterDto
    ): Promise<UserResponseInterface> {
    const hashedPassword = await this.hashData(registrationData.password);

    try {
      const user = await this.usersService.createUser({
        ...registrationData,
        password: hashedPassword,
      });
      user.password = undefined;
      user.currentRefreshToken = undefined;

      const tokens = await this.buildUserResponse(user.id, user.roles.join());

      return {
        user: {
          ...user,
          ...tokens
        },
      };
    } catch (error) {
      if (error?.code === PostgresErrorCode.UniqueViolation) {
        throw new HttpException(
          'User with that email already exists',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Log In
  async logIn(
    data: LogInDto
    ): Promise<UserResponseInterface> {
    const user = await this.usersService.getByEmail(data.email);

    if (!user) {
      throw new HttpException('User does not exist', HttpStatus.NOT_FOUND);
    }
    const passwordMatches = await argon2.verify(user.password, data.password);

    if (!passwordMatches) {
      throw new HttpException('Password is incorrect', HttpStatus.BAD_REQUEST);
    }

    user.password = undefined;
    user.currentRefreshToken = undefined;

    const tokens = await this.buildUserResponse(user.id, user.roles.join());

    return {
      user: {
        ...user,
        ...tokens
      },

    };
  }

  // Create response for register & login
  async buildUserResponse(
    userId: number, roles: string
    ): Promise<Tokens> {
    const tokens = await this.generateTokens(userId, roles);
    await this.updateRefreshToken(userId, tokens.refresh_token);

    return tokens;
  }

  // Logout
  async logOut(userId: number): Promise<void> {
    await this.updateRefreshToken(userId, null);
  }

  // Write new refresh token in to db
  async updateRefreshToken(userId: number, refreshToken: string):Promise<void> {
    const hashedToken = await this.hashData(refreshToken);
    await this.usersService.updateUser(
      userId,
      { currentRefreshToken: hashedToken }
    );
  }

  // Update tokens after expiration access_token
  async refreshTokens(userId: number, refreshToken: string): Promise<Tokens> {
    const user = await this.usersService.getById(userId);
    if (!user || !user.currentRefreshToken) {
      throw new HttpException('Access Denied', HttpStatus.FORBIDDEN);
    }

    const refreshTokenMatches = await argon2.verify(
      user.currentRefreshToken,
      refreshToken,
    );

    if (!refreshTokenMatches) {
      throw new HttpException('Access Denied', HttpStatus.FORBIDDEN);
    }
    const tokens = await this.generateTokens(user.id, user.roles.join());
    await this.updateRefreshToken(user.id, tokens.refresh_token);
    return tokens;
  }

  async hashData(data: string):Promise<string> {
    const result = await argon2.hash(data);
    return result;
  }

  // Generate tokens
  async generateTokens(userId: number, roles: string): Promise<Tokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          type: roles
        },
        {
          secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
          expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME'),
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          type: roles
        },
        {
          secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
          expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME'),
        },
      ),
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

}