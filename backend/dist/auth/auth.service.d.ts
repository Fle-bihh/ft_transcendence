import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private readonly jwtService;
    private clientId;
    private clientSecret;
    private redirectUri;
    constructor(jwtService: JwtService);
    validateOAuthLogin(profile: any): Promise<string>;
    getUserByToken(token: string): Promise<any>;
}
