import { Repository } from 'typeorm';
import { UserCredentialsDto } from './dto/user-credentials.dto';
import { User } from 'src/entities/user.entity';
import { Game } from 'src/entities/game.entity';
export declare class UsersService {
    private usersRepository;
    constructor(usersRepository: Repository<User>);
    signUp(userCredentialsDto: UserCredentialsDto): Promise<void>;
    getGames(user: User): Promise<{
        games: Game[];
    }>;
    getMatchHistory(id: string, user: User): Promise<{
        games: Game[];
    }>;
    getUserById(id: string, user?: User): Promise<User>;
    getUserByLogin(username: string): Promise<User>;
    patchUsername(id: string, user: User, username: string): Promise<User>;
    activate2FA(user: User): Promise<void>;
    get2FA(user: User): Promise<{
        twoFactorAuth: boolean;
    }>;
}
