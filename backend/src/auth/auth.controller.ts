import {Controller, Post, Query, Req, UseGuards} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { User } from "src/entities/user.entity";
import {AuthService} from "./auth.service";
import {Auth42Dto} from "./dto/auth-42.dto";

@Controller('/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/api42/Signin')
  async signIn42(@Query() auth42Dto: Auth42Dto): Promise <{ accessToken: string, user: User }> {
    return await this.authService.signIn42(auth42Dto);
  }
}
