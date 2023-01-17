// import { Body, Controller, Post } from '@nestjs/common';
// import {AuthService} from './auth.service';
// import {Auth42Dto} from './dto/auth-42.dto';

// @Controller('auth')
// export class AuthController {
//   constructor(private authService: AuthService,) {}

//   @Post('api42/signin')
//   async signIn42(@Body() auth42Dto: Auth42Dto) : Promise<{accessToken: string}> {
//     return await this.authService.signIn42(auth42Dto);
//   }
// }
//
//
// auth.controller.ts
import { Controller, Get, UseGuards, Redirect } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('42')
  @UseGuards(AuthGuard('42'))
  @Redirect('https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-2ba494ca541577ab12aead4ea4f59fc22b4c2bea05058775f2524344f2e602a9&redirect_uri=http://127.0.0.1:3000/home&response_type=code&scope=public')
  async redirectTo42() {
    return {};
  }

  @Get('42/callback')
  @UseGuards(AuthGuard('42'))
  async ApiCallback(req) {
    const jwt = await this.authService.validateOAuthLogin(req.user);
    return { jwt };
  }
}

