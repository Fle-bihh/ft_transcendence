import { Body, Controller, Get, Param, Patch, Post, Put } from '@nestjs/common';
import {GetUser} from 'src/auth/get-user.decorator';
import {Game} from 'src/entities/game.entity';
import {User} from 'src/entities/user.entity';
import {UserCredentialsDto} from './dto/user-credentials.dto';
import {UsersService} from './users.service';

@Controller('user')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('/signup')
  async signUp(@Body() usersCredentialsDto: UserCredentialsDto): Promise<void> {
    return this.usersService.signUp(usersCredentialsDto);
  }

  @Patch('/:id/username')
  async patchUsername(@Param('id') id: string, @GetUser() user: User, @Body('username') username: string): Promise<User> {
    console.log('bonjour');
    return this.usersService.patchUsername(id, user, username);
  }

  @Patch('2FA/activate')
  async activate2FA(@GetUser() user: User): Promise<void> {
    return await this.usersService.activate2FA(user);
  }

  @Get('/id/:id')
  async getUserById(@Param('id') id: string, @GetUser() user: User): Promise<User> {
    return await this.usersService.getUserById(id, user);
  }

  @Get('/login/:login')
  async getUserByLogin(@Param('login') login: string): Promise<User> {
    return await this.usersService.getUserByLogin(login);
  }

  @Get('/:id/match_history')
  async getMatchHistory(@Param('id') id: string, @GetUser() user: User): Promise<{ games: Game[] }> {
    return await this.usersService.getMatchHistory(id, user);
  }

  @Get('2FA/active')
  async get2FA(@GetUser() user: User): Promise<{ twoFactorAuth: boolean }> {
    return await this.usersService.get2FA(user);
  }
}
