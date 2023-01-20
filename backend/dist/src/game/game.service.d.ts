import { AuthService } from 'src/auth/auth.service';
import { Game } from 'src/entities/game.entity';
import { User } from 'src/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { GameResultsDto } from './dto/game-results.dto';
export declare class GameService {
    private gameRepository;
    private usersRepository;
    private readonly authService;
    private readonly userService;
    constructor(gameRepository: Repository<Game>, usersRepository: Repository<User>, authService: AuthService, userService: UsersService);
    createGame(gameResultsDto: GameResultsDto): Promise<void>;
}
