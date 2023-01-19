import { AuthService } from "./auth.service";
import { Auth42Dto } from "./dto/auth-42.dto";
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    signIn42(auth42Dto: Auth42Dto): Promise<{
        accessToken: string;
    }>;
}
