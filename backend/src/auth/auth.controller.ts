import {Controller, Post, Query} from "@nestjs/common";
import {AuthService} from "./auth.service";
import {Auth42Dto} from "./dto/auth-42.dto";

@Controller('/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/api42/signin')
  async signIn42(@Query() auth42Dto: Auth42Dto): Promise <{ accessToken: string }> {
    return await this.authService.signIn42(auth42Dto);
  }
}
