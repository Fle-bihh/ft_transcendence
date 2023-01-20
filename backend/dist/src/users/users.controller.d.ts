import { Game } from 'src/entities/game.entity';
import { User } from 'src/entities/user.entity';
import { UserCredentialsDto } from './dto/user-credentials.dto';
import { UsersService } from './users.service';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    signUp(usersCredentialsDto: UserCredentialsDto): Promise<void>;
    patchUsername(id: string, user: User, username: string): Promise<User>;
    activate2FA(user: User): Promise<void>;
    getUserById(id: string, user: User): Promise<User>;
    getUserByLogin(login: string): Promise<User>;
    getMatchHistory(id: string, user: User): Promise<{
        games: Game[];
    }>;
    get2FA(user: User): Promise<{
        twoFactorAuth: boolean;
    }>;
}
