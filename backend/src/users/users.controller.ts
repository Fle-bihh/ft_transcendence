import { BadRequestException, Body, Controller, Get, Param, Patch, Post, Put, Req, Response, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/get-user.decorator';
import { Game } from 'src/entities/game.entity';
import { User } from 'src/entities/user.entity';
import { UserCredentialsDto } from './dto/user-credentials.dto';
import { UsersService } from './users.service';

@Controller('user')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private usersService: UsersService) { }

  @Post('/signup')
  async signUp(@Body() usersCredentialsDto: UserCredentialsDto): Promise<void> {
    return this.usersService.signUp(usersCredentialsDto);
  }

  @Patch('/:id/username')
  async patchUsername(@Param('id') id: string, @GetUser() user: User, @Body('username') username: string): Promise<User> {
    console.log('bonjour');
    return await this.usersService.patchUsername(id, user, username);
  }

  @Patch('/:id/profileImage')
  async patchProfileImage(@Param('id') id: string, @GetUser() user: User, @Body('profileImage') profileImage: string) {
    console.log('ohhhhhhhhhhh', profileImage);
    return await this.usersService.patchProfileImage(id, user, profileImage);
  }

  @Get('/:id/2fa/generate')
  async register(@Response() response, @Param('id') id: string) {
    const user: User = await this.usersService.getUserById(id);
    const { otpAuthUrl } =
      await this.usersService.generateTwoFactorAuthenticationSecret(user);
    return response.json(
      await this.usersService.generateQrCodeDataURL(otpAuthUrl),);
  }

  @Get('/id/:id')
  async getUserById(@Param('id') id: string, @GetUser() user: User): Promise<User> {
    return await this.usersService.getUserById(id, user);
  }

  @Get('/login/:login')
  async getUserByLogin(@Param('login') login: string): Promise<User> {
    return await this.usersService.getUserByLogin(login);
  }

  @Get('/username/:username')
  async getUserByUsername(@Param('username') username: string): Promise<User> {
    return await this.usersService.getUserByUsername(username);
  }

  @Get('/:id/match_history')
  async getMatchHistory(@Param('id') id: string, @GetUser() user: User) {
    return await this.usersService.getMatchHistory(id, user);
  }

  @Get('2FA/active')
  async get2FA(@GetUser() user: User): Promise<{ twoFactorAuth: boolean }> {
    return await this.usersService.get2FA(user);
  }

  @Get('/:id/2fa/deactivate')
  async deactivate2FA(@Param('id') id: string) {
    const user = await this.usersService.getUserById(id);
    return await this.usersService.deactivate2FA(user);
  }

  @Get('/:id/2FA/activate/:secret')
  async activate2FA(@Param('id') id: string, @Param('secret') secret: string): Promise<User> {
    const user: User = await this.usersService.getUserById(id);
    const isCodeValid: boolean = this.usersService.isTwoFactorAuthenticationCodeValid(secret, user);
    if (!isCodeValid)
      throw new UnauthorizedException('Wrong authentication code');
    return await this.usersService.activate2FA(user);
  }

  @Get('/:id/2fa/verify/:secret')
  async verify2FA(@Param('id') id: string, @Param('secret') secret: string): Promise<boolean> {
    const user: User = await this.usersService.getUserById(id);
    const isCodeValid: boolean = this.usersService.isTwoFactorAuthenticationCodeValid(secret, user);
    if (!isCodeValid)
      throw new UnauthorizedException('Wrong authentication code');
    return isCodeValid;
  }
}
