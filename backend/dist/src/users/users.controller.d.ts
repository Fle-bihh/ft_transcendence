import { Game } from 'src/entities/game.entity';
import { User } from 'src/entities/user.entity';
import { UserCredentialsDto } from './dto/user-credentials.dto';
import { UsersService } from './users.service';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    signUp(usersCredentialsDto: UserCredentialsDto): Promise<void>;
    patchUsername(id: string, user: User, username: string): Promise<User>;
    getUserById(id: string, user: User): Promise<User>;
    getMatchHistory(id: string, user: User): Promise<{
        games: Game[];
    }>;
}
