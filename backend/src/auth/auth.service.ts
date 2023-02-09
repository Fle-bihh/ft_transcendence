import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { JwtPayload } from './jwt-payload.interface';
import { Auth42Dto } from './dto/auth-42.dto';
import { HttpService } from '@nestjs/axios';
import { UsersService } from 'src/users/users.service';
import { lastValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly authorizationURI: string = 'https://api.intra.42.fr/oauth/token';
  private accessToken: string;
  private headers: { Authorization: string };
  private readonly endpoint: string = 'https://api.intra.42.fr/v2';
  // private readonly clientId: string = 'u-s4t2ud-2ba494ca541577ab12aead4ea4f59fc22b4c2bea05058775f2524344f2e602a9';
  // private readonly clientSecret: string = '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';

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private http: HttpService,
    private userService: UsersService,
    private configService: ConfigService,
  ) { }

  private readonly clientId: string = this.configService.get('CLIENT_ID');
  private readonly clientSecret: string = this.configService.get('CLIENT_SECRET');
  private readonly redirectURI: string = this.configService.get('REDIRECT_URI');

  async setAuthCredentialsDto(data: { username: string, login: string, profileImage: string, email: string }): Promise<AuthCredentialsDto> {
    let user: User = await this.usersRepository.findOne({
      where: {
        username: data.username,
      }
    });
    if (user) {
      data.username = data.username + Math.floor(1000 + Math.random() * 9000);
      return this.setAuthCredentialsDto(data)
    }
    else
      return ({ username: data.username, login: data.login, profileImage: data.profileImage, email: data.email, admin: false, games: [], messagesSent: [], messagesReceived: [], channels: [], channelsAdmin: [], channelsConnected: [], blockList: [] });
  }

  async signIn42(auth42Dto: Auth42Dto): Promise<{ accessToken: string, user: User }> {
    try {
      const token = this.http.post(
        `${this.authorizationURI}?grant_type=authorization_code&client_id=${this.clientId}&client_secret=${this.clientSecret}&code=${auth42Dto.code}&redirect_uri=${this.redirectURI}`,
      );
      this.accessToken = (await lastValueFrom(token)).data.access_token;
      this.headers = { Authorization: `Bearer ${this.accessToken}` };
      const response$ = this.http.get(`${this.endpoint}/me`, {
        headers: this.headers,
      });
      const { data } = await lastValueFrom(response$);
      const authCredentialsDto: AuthCredentialsDto = await this.setAuthCredentialsDto({ username: data.login, login: data.login, profileImage: data.image.link, email: data.email });
      const { login } = authCredentialsDto;
      let user: User;
      try {
        user = await this.userService.getUserByLogin(data.login);
        user.firstConnection = false;
        await this.usersRepository.save(user);
      } catch (e) {
        try {
          await this.usersRepository.save(authCredentialsDto);
        }
        catch (error) {
          throw new InternalServerErrorException();
        }
      }
      user = await this.userService.getUserByLogin(data.login);
      const payload: JwtPayload = { login };
      const accessToken: string = this.jwtService.sign(payload);
      return { accessToken: accessToken, user: user };
    } catch (e) {
      console.log("errrorr ===== ", e);
      return null;
    }
  }

  async getUserFromToken(token: string): Promise<User> {
    try {
      const payload = this.jwtService.verify(token);
      if (payload.login) {
        return this.userService.getUserByLogin(payload.login);
      }
    } catch (e) { console.log(e) }
  }
}
