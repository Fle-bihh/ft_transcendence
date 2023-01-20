import { UsersService } from 'src/users/users.service';
import { GameResultsDto } from './dto/game-results.dto';
import { GameService } from './game.service';
export declare class GameController {
    private readonly gameService;
    private readonly userService;
    constructor(gameService: GameService, userService: UsersService);
    createGame(gameResultsDto: GameResultsDto): Promise<void>;
}
