import { Body, Controller, Post } from '@nestjs/common';
import {UserCredentialsDto} from './dto/user-credentials.dto';
import {UsersService} from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('/signup')
  async signUp(@Body() usersCredentialsDto: UserCredentialsDto): Promise<void> {
    return this.usersService.signUp(usersCredentialsDto);
  }
}
