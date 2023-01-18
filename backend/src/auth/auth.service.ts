// import { ConflictException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
// import {JwtService} from '@nestjs/jwt';
// import {InjectRepository} from '@nestjs/typeorm';
// import {User} from 'src/entities/user.entity';
// import * as bcrypt from 'bcrypt';
// import {Repository} from 'typeorm';
// import {AuthCredentialsDto} from './dto/auth-credentials.dto';
// import {JwtPayload} from './jwt-payload.interface';
// import {Auth42Dto} from './dto/auth-42.dto';

// @Injectable()
// export class AuthService {
//   constructor(
//     @InjectRepository(User)
//     private usersRepository: Repository<User>,
//     private jwtService: JwtService,
//   ) {}

//   async signUp(authCredentialsDto: AuthCredentialsDto): Promise<void> {
//     const salt = await bcrypt.genSalt();
//     const hashedPassword = await bcrypt.hash(authCredentialsDto.password, salt);
//     authCredentialsDto.password = hashedPassword;
//     try {
//       await this.usersRepository.save(authCredentialsDto);
//     }
//     catch (error) {
//       if (error.code === '23505') { // duplicate username
//         throw new ConflictException('Username already exists');
//       }
//       else {
//         throw new InternalServerErrorException();
//       }
//     }
//   }

//   async signIn(authCredentialsDto: AuthCredentialsDto): Promise<{ accessToken: string }> {
//     const {username, password} = authCredentialsDto;
//     const user = await this.usersRepository.findOne({ where: {
//       username: username,
//     } });

//     if (user && (await bcrypt.compare(password, user.password))) {
//       const payload: JwtPayload = { username };
//       const accessToken: string = this.jwtService.sign(payload);
//       return { accessToken };
//     }
//     else {
//       throw new UnauthorizedException('Please check your login credentials');
//     }
//   }

//   async signIn42(auth42Dto: Auth42Dto): Promise<{ accessToken: string }> {
//     try {
//       const token = this.http.post(
//         `${this.authorizationURI}?grant_type=authorization_code&client_id=${this.clientId}&client_secret=${this.clientSecret}&code=${auth42Dto.code}&redirect_uri=${this.redirectURI}`,
//       );

//       this.accessToken = (await lastValueFrom(token)).data.access_token;
//       this.headers = { Authorization: `Bearer ${this.accessToken}` };

//       const response$ = this.http.get(`${this.endpoint}/me`, {
//         headers: this.headers,
//       });
//       const { status, data } = await lastValueFrom(response$);

//       const authCredentialsDto: AuthCredentialsDto = {
//         username: data.login,
//         password: null,
//         nickName: auth42Dto.nickName,
//         firstName: data.first_name,
//         lastName: data.last_name,
//         profileImage: data.image_url,
//         email: data.email,
//         admin: auth42Dto.admin,
//       };

//       const { username } = authCredentialsDto;
//       let user: User = await this.usersRepository.findOne({ username });

//       if (!user) {
//         await this.usersRepository.createUser42(authCredentialsDto);
//       }

//       const payload: JwtPayload = { username };
//       const accessToken: string = this.jwtService.sign(payload);
//       user = await this.usersRepository.findOne({ username });
//       user.isLogged = "online";
//       await this.usersRepository.save(user);
//       return { accessToken: accessToken };
//     } catch (error) {
//       this.logger.error(error);
//     }
//   }

// }
//
//
// auth.service.ts
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor(/*private readonly config: ConfigService,*/ private readonly jwtService: JwtService) {
    this.clientId = 'u-s4t2ud-2ba494ca541577ab12aead4ea4f59fc22b4c2bea05058775f2524344f2e602a9' /*this.config.get('CLIENT_ID')*/;
    this.clientSecret = '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'/*this.config.get('CLIENT_SECRET')*/;
    this.redirectUri = 'localhost:3000/home'/*this.config.get('REDIRECT_URI')*/;
  }

  async validateOAuthLogin(profile: any): Promise<string> {
    const { code } = profile;
    const tokenResponse = await axios.post('https://api.intra.42.fr/oauth/token', {
      code,
      client_id: this.clientId,
      client_secret: this.clientSecret,
      redirect_uri: this.redirectUri,
      grant_type: 'authorization_code',
    });
    const { access_token } = tokenResponse.data;
    const user = await this.getUserByToken(access_token);
    const payload = { sub: user.id };
    return this.jwtService.sign(payload);
  }

  async getUserByToken(token: string) {
    const userResponse = await axios.get('https://api.intra.42.fr/v2/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return userResponse.data;
  }
}

