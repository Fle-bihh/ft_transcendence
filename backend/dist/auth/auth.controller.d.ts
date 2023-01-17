import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    redirectTo42(): Promise<{}>;
    ApiCallback(req: any): Promise<{
        jwt: string;
    }>;
}
