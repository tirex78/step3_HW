import { Body, Controller, HttpCode, Post, Get, UseGuards, HttpStatus } from '@nestjs/common';
import { AuthenticationService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { JwtRefreshGuard } from './guard/jwt-refresh.guard';
import { LogInDto } from './dto/login.dto';
import { GetCurrentUser } from './decorators/get-current-user.decorator';
import { Public } from './decorators/public.decorator';
import { UserResponseInterface } from 'src/users/type/user-responce.interface';
import { Tokens } from './type/tokens.type';

@Controller('auth')
export class AuthenticationController {
  constructor(
    private readonly authenticationService: AuthenticationService,
  ) { }
  
  @Public()
  @Post('registration')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registrationData: RegisterDto): Promise<UserResponseInterface> {
    const user = await this.authenticationService.register(registrationData);
    return user;
  }

  @Public()
  @Post('login')
  async login(@Body() data: LogInDto): Promise<UserResponseInterface> {
    return this.authenticationService.logIn(data);
  }

  @Post('logout')
  async logout(@GetCurrentUser('sub') userId: number): Promise<void> {
    await this.authenticationService.logOut(userId);
  }

  @Public()
  @UseGuards(JwtRefreshGuard)
  @Get('refresh')
  async refreshTokens(
    @GetCurrentUser('sub') userId: number,
    @GetCurrentUser('refreshToken') refreshToken: string
  ): Promise<Tokens> {
    return this.authenticationService.refreshTokens(userId, refreshToken);
  }
}