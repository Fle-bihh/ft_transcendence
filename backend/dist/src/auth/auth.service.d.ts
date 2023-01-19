import { JwtService } from '@nestjs/jwt';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { Auth42Dto } from './dto/auth-42.dto';
import { HttpService } from '@nestjs/axios';
import { UsersService } from 'src/users/users.service';
export declare class AuthService {
    private usersRepository;
    private jwtService;
    private http;
    private userService;
    private readonly authorizationURI;
    private readonly clientId;
    private readonly clientSecret;
    private readonly redirectURI;
    private accessToken;
    private headers;
    private readonly endpoint;
    private logger;
    constructor(usersRepository: Repository<User>, jwtService: JwtService, http: HttpService, userService: UsersService);
    signIn42(auth42Dto: Auth42Dto): Promise<{
        accessToken: string;
    }>;
}
