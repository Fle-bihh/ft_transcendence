import { BadRequestException, UseInterceptors, Body, Controller, Get, Param, Patch, Post, Put, Req, Response, UnauthorizedException, UseGuards, UploadedFile, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/get-user.decorator';
import { Game } from 'src/entities/game.entity';
import { User } from 'src/entities/user.entity';
import { UserCredentialsDto } from './dto/user-credentials.dto';
import { UsersService } from './users.service';
import { Express } from 'express'
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import { existsSync, mkdirSync, readFileSync, unlink } from 'fs';

export const multerOptions = {
  limits: {
      fileSize: 1048576,
  },
  fileFilter: (req: any, file: any, cb: any) => {
      if (file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          cb(null, true);
      } else {
          cb(new BadRequestException(`Unsupported file type ${extname(file.originalname)}`));
      }
  },
  storage: diskStorage({
      destination: './uploads/profileImages',
      filename: (req: any, file: any, cb: any) => {
          cb(null, `${uuidv4()}${extname(file.originalname)}`);
      },
  }),
};

@Controller('user')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private usersService: UsersService) { }

  @Get()
  async getAll(): Promise<User[]> {
    return await this.usersService.getAll()
  }

  @Post('/signup')
  async signUp(@Body() usersCredentialsDto: UserCredentialsDto): Promise<void> {
    return this.usersService.signUp(usersCredentialsDto);
  }

  @Patch('/:id/username')
  async patchUsername(@Param('id') id: string, @GetUser() user: User, @Body('username') username: string): Promise<User> {
    console.log('bonjour');
    return await this.usersService.patchUsername(id, user, username);
  }

  @Get('/profilePic/:fileId')
  async getProfilePic(@Param('fileId') fileId: string, @Res() res): Promise<Object> {

    const fileName = fileId.split(':')[1];
    var options = {
      root: (process.cwd() + '/uploads/profileImages/')
    };

	//const user = await this.usersService.getUserById(data.id);
	//if (user.profileImage.substring(8, 11) == "cdn") {
		//return res.sendFile(fileName, options, function (err) {
		//	if (err) {
		//		throw new BadRequestException('Unable to find user\'s avatar');
		//	}
		//});
	//}
	return res.sendFile(fileName, options);
  }

  @Post('/:id/profileImage')
  @UseInterceptors(FileInterceptor('photo', multerOptions))
  public async uploadFile(@UploadedFile() image: any, @Param('id') id: string) {
	if (image.filename) {
		let buffer = readFileSync(process.cwd() + '/uploads/profileImages/'+ image.filename)
		const res = await this.usersService.checkMagicNumber(image.mimetype, buffer);
		if (!res) {
			unlink(process.cwd() + '/uploads/profileImages/'+ image.filename, (err) => {
				if(err)
				return err;
			});
			throw new BadRequestException('Unable to update your avatar.')
		}
		const ret = this.usersService.updateProfilePic(id, image.filename)
		return ret;
	} else
		throw new BadRequestException('Unable to update your avatar, file too big.');
  }

  // @Patch('/:id/profileImage')
  // async patchProfileImage(@Param('id') id: string, @GetUser() user: User, @Body('profileImage') profileImage: string) {
  //   console.log('ohhhhhhhhhhh', profileImage);
  //   return await this.usersService.patchProfileImage(id, user, profileImage);
  // }

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
